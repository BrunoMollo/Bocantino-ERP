import {
	t_ingredient_batch,
	t_product_batch,
	tr_ingredient_batch_ingredient_batch,
	tr_product_batch_ingredient_batch
} from '../db/schema';
import { db, type Tx } from '../db';
import { and, eq, sql, sum } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { getFirstIfPosible } from '$lib/utils';

const batches_in_production = alias(t_ingredient_batch, 'batches_in_production');

/*
 * This show the availale amount of a batch considering that the amounts that are already
 * assigned to a production are not available, even if the production is not finished
 * */
export const sq_stock = db.$with('stock').as(
	db
		.select({
			batch_id: t_ingredient_batch.id,
			currently_available: sql<number>`
          + ${t_ingredient_batch.initial_amount}
          - COALESCE(${sum(tr_ingredient_batch_ingredient_batch.amount_used_to_produce_batch)} ,0) 
          - COALESCE(${sum(tr_product_batch_ingredient_batch.amount_used_to_produce_batch)} ,0) 
          + COALESCE(${t_ingredient_batch.adjustment}, 0)`
				.mapWith(Number)
				.as('currently_available')
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
		.leftJoin(
			tr_product_batch_ingredient_batch,
			eq(tr_product_batch_ingredient_batch.ingredient_batch_id, t_ingredient_batch.id)
		)
		.where(and(eq(t_ingredient_batch.state, 'AVAILABLE')))
		.groupBy(t_ingredient_batch.id)
);

/* Auxilar table for sq_material_stock*/
const sq_produced_batch_ingredients = db.$with('sq_produced_batch_ingredients').as(
	db
		.select({
			used_batch_id: tr_ingredient_batch_ingredient_batch.used_batch_id,
			amount_used: tr_ingredient_batch_ingredient_batch.amount_used_to_produce_batch
		})
		.from(tr_ingredient_batch_ingredient_batch)
		.innerJoin(
			t_ingredient_batch,
			eq(tr_ingredient_batch_ingredient_batch.produced_batch_id, t_ingredient_batch.id)
		)
		.where(eq(t_ingredient_batch.state, 'AVAILABLE'))
);

/* Auxilar table for sq_material_stock*/
const sq_produced_batch_products = db.$with('sq_produced_batch_products').as(
	db
		.select({
			used_batch_id: tr_product_batch_ingredient_batch.ingredient_batch_id,
			amount_used: tr_product_batch_ingredient_batch.amount_used_to_produce_batch
		})
		.from(tr_product_batch_ingredient_batch)
		.innerJoin(
			t_product_batch,
			eq(tr_product_batch_ingredient_batch.produced_batch_id, t_product_batch.id)
		)
		.where(eq(t_product_batch.state, 'AVAILABLE'))
);

/*
 * This show the availale amount of a batch considering that the stock is gone
 * once the produciton (of ingredient or product) are finished
 * */
export const sq_material_stock = db.$with('stock').as(
	db
		.with(sq_produced_batch_ingredients, sq_produced_batch_products)
		.select({
			batch_id: t_ingredient_batch.id,
			currently_available: sql<number>`
          + ${t_ingredient_batch.initial_amount}
          - COALESCE(${sum(sq_produced_batch_ingredients.amount_used)} ,0) 
          - COALESCE(${sum(sq_produced_batch_products.amount_used)} ,0) 
          + COALESCE(${t_ingredient_batch.adjustment}, 0)`
				.mapWith(Number)
				.as('currently_available')
		})
		.from(t_ingredient_batch)
		.leftJoin(
			sq_produced_batch_ingredients,
			eq(sq_produced_batch_ingredients.used_batch_id, t_ingredient_batch.id)
		)
		.leftJoin(
			sq_produced_batch_products,
			eq(sq_produced_batch_products.used_batch_id, t_ingredient_batch.id)
		)
		.where(eq(t_ingredient_batch.state, 'AVAILABLE'))
		.groupBy(t_ingredient_batch.id)
);

export async function check_if_empry_and_mark(batch_id: number, tx?: Tx) {
	const batch = await (tx ?? db)
		.with(sq_material_stock)
		.select()
		.from(sq_material_stock)
		.where(eq(sq_material_stock.batch_id, batch_id))
		.then(getFirstIfPosible);

	if (!batch) return 'batch not found';

	if (batch.currently_available !== 0) return 'stock is OK';

	await (tx ?? db)
		.update(t_ingredient_batch)
		.set({ state: 'EMPTY' })
		.where(eq(t_ingredient_batch.id, batch_id));

	return 'marked as EMPTY';
}
