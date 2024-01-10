import { t_ingredient_batch, tr_ingredient_batch_ingredient_batch } from '../db/schema';
import { db } from '../db';
import { eq, sql, sum } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';

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
