import { db, type Tx } from '$lib/server/db';
import { getFirst, getFirstIfPosible } from '$lib/utils';
import { ingredients_service, logicError } from '$logic';
import { alias } from 'drizzle-orm/sqlite-core';
import {
	t_ingredient,
	t_ingredient_batch,
	tr_ingredient_batch_ingredient_batch
} from '../db/schema';
import { eq, and, asc, sum, sql, ne } from 'drizzle-orm';
import { drizzle_map, copy_column, pick_columns } from 'drizzle-tools';

const batches_in_production = alias(t_ingredient_batch, 'batches_in_production');
export const sq_stock = db.$with('stock').as(
	//TODO: substract used amount in production of final products
	db
		.select({
			batch_id: t_ingredient_batch.id,
			currently_available: sql<number>`
          + ${t_ingredient_batch.initialAmount}
          - COALESCE(${sum(tr_ingredient_batch_ingredient_batch.amount_used_to_produce_batch)} ,0) 
          - COALESCE(${t_ingredient_batch.loss}, 0)`.as('currently_available')
		})
		.from(t_ingredient_batch)
		.leftJoin(
			tr_ingredient_batch_ingredient_batch,
			eq(tr_ingredient_batch_ingredient_batch.used_batch_id, t_ingredient_batch.id)
		)
		.leftJoin(
			batches_in_production,
			eq(tr_ingredient_batch_ingredient_batch.produced_batch_id, batches_in_production.id)
		)
		.groupBy(t_ingredient_batch.id)
);

export async function getBatchesByIngredientId(id: number) {
	return await db
		.with(sq_stock)
		.select({
			batch: pick_columns(t_ingredient_batch, ['id', 'batch_code', 'expirationDate']),
			ingredient: t_ingredient,
			stock: {
				current_amount: sq_stock.currently_available
			}
		})
		.from(t_ingredient_batch)
		.innerJoin(t_ingredient, eq(t_ingredient.id, t_ingredient_batch.ingredientId))
		.leftJoin(sq_stock, eq(sq_stock.batch_id, t_ingredient_batch.id))
		.where(and(eq(t_ingredient_batch.ingredientId, id), eq(t_ingredient_batch.state, 'AVAILABLE')))
		.orderBy(asc(t_ingredient_batch.expirationDate))
		.then(copy_column({ from: 'stock', field: 'current_amount', to: 'batch' }))
		.then(
			drizzle_map({
				one: 'batch',
				with_one: ['ingredient'],
				with_many: []
			})
		);
}

export async function getBatchById(id: number, tx?: Tx) {
	return await (tx ?? db)
		.with(sq_stock)
		.select({
			batch: pick_columns(t_ingredient_batch, ['id', 'batch_code', 'expirationDate']),
			ingredient: pick_columns(t_ingredient, ['id', 'name', 'unit']),
			stock: { current_amount: sq_stock.currently_available }
		})
		.from(t_ingredient_batch)
		.innerJoin(t_ingredient, eq(t_ingredient.id, t_ingredient_batch.ingredientId))
		.leftJoin(
			sq_stock,
			and(
				eq(t_ingredient_batch.id, sq_stock.batch_id),
				ne(t_ingredient_batch.state, 'IN_PRODUCTION')
			)
		)
		.where(eq(t_ingredient_batch.id, id))
		.then(copy_column({ from: 'stock', field: 'current_amount', to: 'batch' }))
		.then(
			drizzle_map({
				one: 'batch',
				with_many: [],
				with_one: ['ingredient']
			})
		)
		.then(getFirstIfPosible);
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

		let asigned_amount = 0;
		const still_needed_amount = () => needed_amount - asigned_amount;
		for (let batch of batches) {
			const used_in_batch =
				still_needed_amount() > batch.current_amount ? batch.current_amount : still_needed_amount();
			asigned_amount += used_in_batch;

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
			t_ingredient_batch: pick_columns(t_ingredient_batch, [
				'id',
				'batch_code',
				'initialAmount',
				'productionDate',
				'expirationDate'
			]),
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

export async function closeProduction(obj: { batch_id: number; loss: number }) {
	const { batch_id, loss } = obj;
	return db.transaction(async (tx) => {
		const batch = await tx
			.select()
			.from(t_ingredient_batch)
			.where(
				and(eq(t_ingredient_batch.id, batch_id), eq(t_ingredient_batch.state, 'IN_PRODUCTION'))
			)
			.then(getFirstIfPosible);
		if (!batch) {
			return logicError('batch not found');
		}

		await tx
			.update(t_ingredient_batch)
			.set({
				productionDate: new Date(),
				state: 'AVAILABLE',
				loss
			})
			.where(eq(t_ingredient_batch.id, batch_id));
		return { success: true } as const;
	});
}

