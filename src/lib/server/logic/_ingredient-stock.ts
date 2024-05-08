import {
	t_ingredient_batch,
	tr_ingredient_batch_ingredient_batch,
	tr_product_batch_ingredient_batch
} from '../db/schema';
import { db } from '../db';
import { eq, sql, sum } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

const batches_in_production = alias(t_ingredient_batch, 'batches_in_production');
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
		.where(eq(t_ingredient_batch.state, 'AVAILABLE'))
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
		.groupBy(t_ingredient_batch.id)
);
