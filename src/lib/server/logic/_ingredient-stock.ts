import {
	t_ingredient_batch,
	tr_ingredient_batch_ingredient_batch,
	tr_product_batch_ingredient_batch
} from '../db/schema';
import { db } from '../db';
import { eq, sql } from 'drizzle-orm';
import { PgTable, alias, getTableConfig } from 'drizzle-orm/pg-core';

function full_name<T extends PgTable>(t: T, x: keyof T) {
	const table_name = getTableConfig(t).name;
	//@ts-expect-error PENDING: explain
	const col_name = t[x].name;
	return `"${table_name}"."${col_name}"`;
}

function coalese_sum(query: string) {
	return `COALESCE(SUM(${query}),0) `;
}

function truncate(query: string) {
	return `TRUNC( CAST( ${query} AS numeric),3) `;
}

const batches_in_production = alias(t_ingredient_batch, 'batches_in_production');

const initial_amount = full_name(t_ingredient_batch, 'initial_amount');

const amount_used_to_other_ingredients = full_name(
	tr_ingredient_batch_ingredient_batch,
	'amount_used_to_produce_batch'
);

const amount_used_for_products = full_name(
	tr_product_batch_ingredient_batch,
	'amount_used_to_produce_batch'
);

const adjustment = full_name(t_ingredient_batch, 'adjustment');

export const sq_stock = db.$with('stock').as(
	db
		.select({
			batch_id: t_ingredient_batch.id,
			currently_available: sql
				.raw(
					truncate(`
                    + ${initial_amount}
                    - ${coalese_sum(amount_used_to_other_ingredients)}
                    - ${coalese_sum(amount_used_for_products)}
                    + COALESCE(${adjustment}, 0)`)
				)
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

export const aaa = sql.raw(`
select "ingredient_batch"."id",
          + "ingredient_batch"."full_amount"
          - COALESCE(sum("r_ingredient_batch_ingredient_batch"."amount_used") ,0)
          - COALESCE(sum("r_product_batch_ingredient_batch"."amount_used") ,0)
          + COALESCE("ingredient_batch"."adjustment", 0) as "currently_available" 
  from "ingredient_batch" 
  left join "r_ingredient_batch_ingredient_batch" 
    on "r_ingredient_batch_ingredient_batch"."used_batch_id" = "ingredient_batch"."id" 
  left join "ingredient_batch" "batches_in_production" 
    on "r_ingredient_batch_ingredient_batch"."produced_batch_id" = "batches_in_production"."id" 
  left join "r_product_batch_ingredient_batch" 
    on "r_product_batch_ingredient_batch"."ingredient_batch_id" = "ingredient_batch"."id" 
  where "ingredient_batch"."state" = 'AVAILABLE' group by "ingredient_batch"."id"
`);
