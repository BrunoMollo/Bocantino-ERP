import { db, type Tx } from '$lib/server/db';
import { getFirst, getFirstIfPosible } from '$lib/utils';
import { ingredients_service, logicError } from '$logic';
import { alias } from 'drizzle-orm/sqlite-core';
import {
	t_ingredient,
	t_ingredient_batch,
	tr_ingredient_batch_ingredient_batch
} from '../db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { drizzle_map, copy_column, pick_columns } from 'drizzle-tools';

export function _calculate_available_amount(data: {
	initialAmount: number;
	usedAmount: number;
	loss: number | null;
	to_be_used_amount: number;
}) {
	return data.initialAmount - data.usedAmount - (data.loss ?? 0) - data.to_be_used_amount;
}

export async function getBatchesByIngredientId(id: number) {
	const list = await db
		.select({
			id: t_ingredient_batch.id,
			batch_code: t_ingredient_batch.batch_code,
			expirationDate: t_ingredient_batch.expirationDate,
			initialAmount: t_ingredient_batch.initialAmount,
			usedAmount: t_ingredient_batch.usedAmount,
			loss: t_ingredient_batch.loss,
			ingredient: t_ingredient,
			to_be_used_amount: t_ingredient_batch.to_be_used_amount
		})
		.from(t_ingredient_batch)
		.innerJoin(t_ingredient, eq(t_ingredient.id, t_ingredient_batch.ingredientId))
		.where(and(eq(t_ingredient_batch.ingredientId, id), eq(t_ingredient_batch.state, 'AVAILABLE')))
		.orderBy(asc(t_ingredient_batch.expirationDate));

	return list.map((batch) => {
		const { id, batch_code, expirationDate, ingredient } = batch;
		const current_amount = _calculate_available_amount(batch);
		return { id, batch_code, expirationDate, ingredient, current_amount };
	});
}

export async function getBatchById(id: number, tx: Tx) {
	const resultset = await (tx ?? db)
		.select({
			id: t_ingredient_batch.id,
			batch_code: t_ingredient_batch.batch_code,
			expirationDate: t_ingredient_batch.expirationDate,
			initialAmount: t_ingredient_batch.initialAmount,
			usedAmount: t_ingredient_batch.usedAmount,
			loss: t_ingredient_batch.loss,
			ingredient: t_ingredient,
			to_be_used_amount: t_ingredient_batch.to_be_used_amount
		})
		.from(t_ingredient_batch)
		.innerJoin(t_ingredient, eq(t_ingredient.id, t_ingredient_batch.ingredientId))
		.where(eq(t_ingredient_batch.id, id));

	const list = resultset.map((batch) => {
		const { id, batch_code, expirationDate, ingredient } = batch;
		const current_amount = _calculate_available_amount(batch);
		return { id, batch_code, expirationDate, ingredient, current_amount };
	});

	return getFirstIfPosible(list);
}

async function _select_current_to_be_used_amount(id: number, tx: Tx) {
	return await tx
		.select({ current_to_be_used_amount: t_ingredient_batch.to_be_used_amount })
		.from(t_ingredient_batch)
		.where(eq(t_ingredient_batch.id, id))
		.then(getFirst)
		.then((x) => x.current_to_be_used_amount);
}

export async function startIngredientProduction(
	ingredient: { ingedient_id: number; produced_amount: number },
	batches_ids: number[]
) {
	const { ingedient_id, produced_amount } = ingredient;

	if (produced_amount <= 0) {
		return logicError('cantidad a producit invalida');
	}
	if (batches_ids.length < 1 || batches_ids.length > 2) {
		return logicError('cantidad invalida de lotes');
	}
	if ([...new Set(batches_ids)].length != batches_ids.length) {
		return logicError('No se puede usar dos veces el mismo lote');
	}

	const recipe = await ingredients_service.getRecipie(ingedient_id);
	if (!recipe) {
		return logicError('El ingrediente no es derivado');
	}

	const needed_amount = produced_amount * recipe.amount;

	const result = await db.transaction(async (tx) => {
		const batches = [] as Exclude<Awaited<ReturnType<typeof getBatchById>>, undefined>[];

		for (let id of batches_ids) {
			const batch = await getBatchById(id, tx);
			if (!batch) {
				return logicError(`El lote con id ${id} no existe`);
			}

			if (recipe.source.id != batch.ingredient.id) {
				return logicError(
					`El ingrediente deriva de ${recipe.source.name} no de ${batch.ingredient.name}`
				);
			}

			batches.push(batch);
		}

		const total_available_source = batches
			.map((x) => x?.current_amount ?? 0)
			.reduce((acc, prev) => acc + prev, 0);
		if (total_available_source < needed_amount) {
			return logicError(
				`Se requieren ${needed_amount}${batches[0]?.ingredient.unit} pero solo hay ${total_available_source}`
			);
		}

		const total_available_source_minus_one = batches
			.filter((_, i) => i != 0)
			.map((x) => x?.current_amount ?? 0)
			.reduce((acc, prev) => acc + prev, 0);
		if (total_available_source_minus_one > needed_amount) {
			return logicError('Se indicarion mas lotes de los necesarios');
		}

		let asigned_amount = 0;
		const still_needed_amount = () => needed_amount - asigned_amount;

		const new_batch = await tx
			.insert(t_ingredient_batch)
			.values({
				batch_code: 'BOCANTINO-' + (ingedient_id + Date.now()).toString(),
				initialAmount: produced_amount,
				productionDate: null, // is asigned when production ends
				expirationDate: new Date(), //TODO: Define how is the expirationDate calualted
				ingredientId: ingedient_id,
				numberOfBags: 1,
				state: 'IN_PRODUCTION'
			})
			.returning({ id: t_ingredient_batch.id })
			.then(getFirst);

		for (let batch of batches) {
			const current_to_be_used_amount_fist_batch = await _select_current_to_be_used_amount(
				batch.id,
				tx
			);
			const used_in_batch =
				still_needed_amount() > batch.current_amount ? batch.current_amount : still_needed_amount();
			asigned_amount += used_in_batch;
			await tx
				.update(t_ingredient_batch)
				.set({ to_be_used_amount: current_to_be_used_amount_fist_batch + used_in_batch })
				.where(eq(t_ingredient_batch.id, batch.id));

			await tx.insert(tr_ingredient_batch_ingredient_batch).values({
				produced_batch_id: new_batch.id,
				used_batch_id: batch.id,
				amount_used_to_produce_batch: used_in_batch
			});
		}
		return new_batch;
	});

	return result;
}

export async function getBatchesInProduction() {
	const ta_used_batch = alias(t_ingredient_batch, 'used_batches');
	const ta_used_ingredient = alias(t_ingredient, 'used_ingredient');
	return await db
		.select({
			t_ingredient_batch: pick_columns(t_ingredient_batch, ['id', 'batch_code', 'initialAmount']),
			ingredient: pick_columns(t_ingredient, ['id', 'name', 'unit']),
			used_ingredient: pick_columns(ta_used_ingredient, ['id', 'name', 'unit']),
			used_batches: pick_columns(ta_used_batch, ['id', 'batch_code']),
			tr_ingredient_batch_ingredient_batch
		})
		.from(t_ingredient_batch)
		.innerJoin(t_ingredient, eq(t_ingredient.id, t_ingredient_batch.ingredientId))
		.innerJoin(
			tr_ingredient_batch_ingredient_batch,
			eq(tr_ingredient_batch_ingredient_batch.produced_batch_id, t_ingredient_batch.id)
		)
		.innerJoin(
			ta_used_batch,
			eq(tr_ingredient_batch_ingredient_batch.used_batch_id, ta_used_batch.id)
		)
		.innerJoin(ta_used_ingredient, eq(ta_used_batch.ingredientId, ta_used_ingredient.id))
		.where(eq(t_ingredient_batch.state, 'IN_PRODUCTION'))
		.then(
			copy_column({
				from: 'tr_ingredient_batch_ingredient_batch',
				field: 'amount_used_to_produce_batch',
				to: 'used_batches'
			})
		)
		.then(
			drizzle_map({
				one: 't_ingredient_batch',
				with_one: ['ingredient', 'used_ingredient'],
				with_many: ['used_batches']
			})
		);
}

