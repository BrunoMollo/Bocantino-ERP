import { db, type Tx } from '$lib/server/db';
import { getFirst, getFirstIfPosible } from '$lib/utils';
import { ingredients_service, logicError } from '$logic';
import { alias } from 'drizzle-orm/sqlite-core';
import {
	t_ingredient,
	t_ingredient_batch,
	tr_ingredient_batch_ingredient_batch
} from '../db/schema';
import { eq, and, asc, desc, ne, count } from 'drizzle-orm';
import { drizzle_map, copy_column, pick_columns } from 'drizzle-tools';
import { sq_stock } from './ingredient-stock';
import { pick_merge } from 'drizzle-tools/src/pick-columns';

export async function getBatchesByIngredientId(id: number) {
	return await db
		.with(sq_stock)
		.select({
			batch: pick_columns(t_ingredient_batch, ['id', 'batch_code', 'expiration_date']),
			ingredient: pick_columns(t_ingredient, ['id', 'name', 'unit']),
			stock: {
				current_amount: sq_stock.currently_available
			}
		})
		.from(t_ingredient_batch)
		.innerJoin(t_ingredient, eq(t_ingredient.id, t_ingredient_batch.ingredientId))
		.leftJoin(sq_stock, eq(sq_stock.batch_id, t_ingredient_batch.id))
		.where(
			and(
				eq(t_ingredient_batch.ingredientId, id),
				eq(t_ingredient_batch.state, 'AVAILABLE'),
				ne(sq_stock.currently_available, 0)
			)
		)
		.orderBy(asc(t_ingredient_batch.expiration_date))
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
			batch: pick_columns(t_ingredient_batch, ['id', 'batch_code', 'expiration_date']),
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

		const new_batch = await tx
			.insert(t_ingredient_batch)
			.values({
				batch_code: 'BOCANTINO-' + (ingedient_id + Date.now()).toString(),
				initialAmount: produced_amount,
				productionDate: null, // is asigned when production ends
				expiration_date: new Date(), //TODO: Define how is the expiration_date calualted
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

			if (used_in_batch > 0) {
				await tx.insert(tr_ingredient_batch_ingredient_batch).values({
					produced_batch_id: new_batch.id,
					used_batch_id: batch.id,
					amount_used_to_produce_batch: used_in_batch
				});
			}
		}
		return { ...new_batch, type: 'SUCCESS' as const };
	});

	return result;
}

export async function getCountOfAvailableBatches() {
	return await db
		.with(sq_stock)
		.select({
			value: count(t_ingredient_batch.id)
		})
		.from(t_ingredient_batch)
		.innerJoin(sq_stock, eq(t_ingredient_batch.id, sq_stock.batch_id))
		.where(and(eq(t_ingredient_batch.state, 'AVAILABLE'), ne(sq_stock.currently_available, 0)))
		.then((x) => x[0]?.value);
}

export const PAGE_SIZE = 10;
export async function getBatchesAvailable({ page }: { page: number }) {
	const limited_ingredient_batch = db.$with('limited_ingredient_batch').as(
		db
			.with(sq_stock)
			.select(
				pick_merge()
					.table(
						t_ingredient_batch,
						'id',
						'batch_code',
						'productionDate',
						'expiration_date',
						'registration_date',
						'ingredientId'
					)
					.aliased(sq_stock, 'currently_available', 'stock')
					.build()
			)
			.from(t_ingredient_batch)
			.innerJoin(sq_stock, eq(t_ingredient_batch.id, sq_stock.batch_id))
			.where(and(eq(t_ingredient_batch.state, 'AVAILABLE'), ne(sq_stock.currently_available, 0)))
			.limit(PAGE_SIZE)
			.offset(page * PAGE_SIZE)
	);
	limited_ingredient_batch;

	const ta_used_batch = alias(t_ingredient_batch, 'used_batches');
	return await db
		.with(limited_ingredient_batch)
		.select({
			ingredient_batch: pick_columns(limited_ingredient_batch, [
				'id',
				'batch_code',
				'productionDate',
				'expiration_date',
				'stock'
			]),
			ingredient: pick_columns(t_ingredient, ['id', 'name', 'unit']),
			used_batches: pick_columns(ta_used_batch, ['id', 'batch_code']),
			tr_ingredient_batch_ingredient_batch
		})
		.from(limited_ingredient_batch)
		.innerJoin(t_ingredient, eq(t_ingredient.id, limited_ingredient_batch.ingredientId))
		.leftJoin(
			tr_ingredient_batch_ingredient_batch,
			eq(tr_ingredient_batch_ingredient_batch.produced_batch_id, limited_ingredient_batch.id)
		)
		.leftJoin(
			ta_used_batch,
			eq(tr_ingredient_batch_ingredient_batch.used_batch_id, ta_used_batch.id)
		)
		.orderBy(desc(limited_ingredient_batch.registration_date))
		.then(
			drizzle_map({
				one: 'ingredient_batch',
				with_one: ['ingredient'],
				with_many: ['used_batches']
			})
		);
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
				'expiration_date'
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
		return { type: 'SUCCESS' } as const;
	});
}

export async function deleteBatchById(id: number) {
	const found = await db
		.select()
		.from(t_ingredient_batch)
		.where(eq(t_ingredient_batch.id, id))
		.then((x) => Boolean(x.length));

	if (!found) {
		return logicError('lote no encontrado');
	}

	await db
		.delete(tr_ingredient_batch_ingredient_batch)
		.where(eq(tr_ingredient_batch_ingredient_batch.produced_batch_id, id));

	await db.delete(t_ingredient_batch).where(eq(t_ingredient_batch.id, id));

	return { type: 'SUCCESS' } as const;
}

