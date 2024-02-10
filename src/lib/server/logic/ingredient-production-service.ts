import { db as database, type Db, type Tx } from '$lib/server/db';
import { getFirst, getFirstIfPosible, has_repeted } from '$lib/utils';
import { is_ok, logic_error } from '$logic';
import {
	t_ingredient,
	t_ingredient_batch,
	tr_ingredient_batch_ingredient_batch
} from '../db/schema';
import { eq, and, asc, desc, ne, count, inArray, sql, like, ilike } from 'drizzle-orm';
import { drizzle_map, copy_column, pick_columns } from 'drizzle-tools';
import { sq_stock } from './_ingredient-stock';
import { pick_merge } from 'drizzle-tools/src/pick-columns';
import { alias } from 'drizzle-orm/pg-core';
import { ingredients_service } from './ingredient-service';

class IngredientProductionService {
	constructor(private db: Db) {}

	async getBatchesByingredient_id(id: number) {
		return await database
			.with(sq_stock)
			.select({
				batch: pick_columns(t_ingredient_batch, 'id', 'batch_code', 'expiration_date'),
				ingredient: pick_columns(t_ingredient, 'id', 'name', 'unit'),
				stock: {
					current_amount: sq_stock.currently_available
				}
			})
			.from(t_ingredient_batch)
			.innerJoin(t_ingredient, eq(t_ingredient.id, t_ingredient_batch.ingredient_id))
			.leftJoin(sq_stock, eq(sq_stock.batch_id, t_ingredient_batch.id))
			.where(
				and(
					eq(t_ingredient_batch.ingredient_id, id),
					eq(t_ingredient_batch.state, 'AVAILABLE'),
					ne(sq_stock.currently_available, 0)
				)
			)
			.orderBy(
				desc(sql`${t_ingredient_batch.initial_amount} - ${sq_stock.currently_available}`),
				asc(t_ingredient_batch.expiration_date)
			) //A probar si anda esto che
			.then(copy_column({ from: 'stock', field: 'current_amount', to: 'batch' }))
			.then(
				drizzle_map({
					one: 'batch',
					with_one: ['ingredient'],
					with_many: []
				})
			);
	}

	async getBatchById(id: number, tx?: Tx) {
		return await (tx ?? database)
			.with(sq_stock)
			.select({
				batch: pick_columns(t_ingredient_batch, 'id', 'batch_code', 'expiration_date'),
				ingredient: pick_columns(t_ingredient, 'id', 'name', 'unit'),
				stock: { current_amount: sq_stock.currently_available }
			})
			.from(t_ingredient_batch)
			.innerJoin(t_ingredient, eq(t_ingredient.id, t_ingredient_batch.ingredient_id))
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

	async getBatchesByIds(ids: number[], tx?: Tx) {
		return await (tx ?? database)
			.with(sq_stock)
			.select({
				batch: pick_merge()
					.table(t_ingredient_batch, 'id', 'batch_code', 'expiration_date')
					.aliased(sq_stock, 'currently_available', 'stock')
					.build(),
				ingredient: pick_columns(t_ingredient, 'id', 'name', 'unit')
			})
			.from(t_ingredient_batch)
			.innerJoin(t_ingredient, eq(t_ingredient.id, t_ingredient_batch.ingredient_id))
			.leftJoin(
				sq_stock,
				and(
					eq(t_ingredient_batch.id, sq_stock.batch_id),
					ne(t_ingredient_batch.state, 'IN_PRODUCTION')
				)
			)
			.where(inArray(t_ingredient_batch.id, ids))
			.then(
				drizzle_map({
					one: 'batch',
					with_many: [],
					with_one: ['ingredient']
				})
			);
	}

	async startIngredientProduction(
		ingredient: { ingedient_id: number; produced_amount: number },
		batches_ids: number[]
	) {
		const { ingedient_id, produced_amount } = ingredient;

		if (produced_amount <= 0) {
			return logic_error('cantidad a producit invalida');
		}
		if (batches_ids.length < 1 || batches_ids.length > 2) {
			return logic_error('cantidad invalida de lotes');
		}
		if (has_repeted(batches_ids)) {
			return logic_error('No se puede usar dos veces el mismo lote');
		}

		const recipe = await ingredients_service.getRecipie(ingedient_id);
		if (!recipe) {
			return logic_error('El ingrediente no es derivado');
		}

		const needed_amount = produced_amount * recipe.amount;

		const result = await this.db.transaction(async (tx) => {
			const batches = [] as Exclude<Awaited<ReturnType<typeof this.getBatchById>>, undefined>[];

			for (let id of batches_ids) {
				const batch = await this.getBatchById(id, tx);
				if (!batch) {
					return logic_error(`El lote con id ${id} no existe`);
				}

				if (recipe.source.id != batch.ingredient.id) {
					return logic_error(
						`El ingrediente deriva de ${recipe.source.name} no de ${batch.ingredient.name}`
					);
				}
				batches.push(batch);
			}

			const total_available_source = batches
				.map((x) => x?.current_amount ?? 0)
				.reduce((acc, prev) => acc + prev, 0);
			if (total_available_source < needed_amount) {
				return logic_error(
					`Se requieren ${needed_amount}${batches[0]?.ingredient.unit} pero solo hay ${total_available_source}`
				);
			}

			const new_batch = await tx
				.insert(t_ingredient_batch)
				.values({
					batch_code: 'BOCANTINO-' + (ingedient_id + Date.now()).toString(),
					initial_amount: produced_amount,
					production_date: null, // is asigned when production ends
					ingredient_id: ingedient_id,
					number_of_bags: 1,
					state: 'IN_PRODUCTION',
					iva_tax_percentage: 0, //Produced dont have taxes
					perceptions_tax_amount: 0
				})
				.returning({ id: t_ingredient_batch.id })
				.then(getFirst);

			let asigned_amount = 0;
			const still_needed_amount = () => needed_amount - asigned_amount;
			for (let batch of batches) {
				const used_in_batch =
					still_needed_amount() > batch.current_amount
						? batch.current_amount
						: still_needed_amount();
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

	async getCountOfAvailableBatches() {
		return await database
			.with(sq_stock)
			.select({
				value: count(t_ingredient_batch.id)
			})
			.from(t_ingredient_batch)
			.innerJoin(sq_stock, eq(t_ingredient_batch.id, sq_stock.batch_id))
			.where(and(eq(t_ingredient_batch.state, 'AVAILABLE'), ne(sq_stock.currently_available, 0)))
			.then((x) => x[0]?.value);
	}

	public PAGE_SIZE = 10;
	async getBatchesAvailable(filter: { page: number; batch_code: string; ingredient_name: string }) {
		const { page, batch_code, ingredient_name } = filter;

		const possible_ingredinets_ids = await database
			.select()
			.from(t_ingredient)
			.where(ilike(t_ingredient.name, `%${ingredient_name}%`))
			.then((arr) => arr.map((x) => x.id));
		if (possible_ingredinets_ids.length === 0) {
			return [];
		}

		const limited_ingredient_batch = this.db.$with('limited_ingredient_batch').as(
			database
				.with(sq_stock)
				.select(
					pick_merge()
						.table(
							t_ingredient_batch,
							'id',
							'batch_code',
							'production_date',
							'expiration_date',
							'registration_date',
							'ingredient_id'
						)
						.aliased(sq_stock, 'currently_available', 'stock')
						.build()
				)
				.from(t_ingredient_batch)
				.innerJoin(sq_stock, eq(t_ingredient_batch.id, sq_stock.batch_id))
				.where(
					and(
						eq(t_ingredient_batch.state, 'AVAILABLE'),
						ne(sq_stock.currently_available, 0),
						ilike(t_ingredient_batch.batch_code, `%${batch_code}%`),
						inArray(t_ingredient_batch.ingredient_id, possible_ingredinets_ids)
					)
				)
				.limit(this.PAGE_SIZE)
				.offset(page * this.PAGE_SIZE)
		);
		const ta_used_batch = alias(t_ingredient_batch, 'used_batches');
		return await database
			.with(limited_ingredient_batch)
			.select({
				ingredient_batch: pick_columns(
					limited_ingredient_batch,
					'id',
					'batch_code',
					'production_date',
					'expiration_date',
					'stock'
				),
				ingredient: pick_columns(t_ingredient, 'id', 'name', 'unit'),
				used_batches: pick_columns(ta_used_batch, 'id', 'batch_code'),
				tr_ingredient_batch_ingredient_batch
			})
			.from(limited_ingredient_batch)
			.innerJoin(t_ingredient, eq(t_ingredient.id, limited_ingredient_batch.ingredient_id))
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

	async getBatchesInProduction() {
		const ta_used_batch = alias(t_ingredient_batch, 'used_batches');
		const ta_used_ingredient = alias(t_ingredient, 'used_ingredient');
		return await database
			.select({
				t_ingredient_batch: pick_columns(t_ingredient_batch, 'id', 'batch_code', 'initial_amount'),
				ingredient: pick_columns(t_ingredient, 'id', 'name', 'unit'),
				used_ingredient: pick_columns(ta_used_ingredient, 'id', 'name', 'unit'),
				used_batches: pick_merge()
					.table(ta_used_batch, 'id', 'batch_code')
					.table(tr_ingredient_batch_ingredient_batch, 'amount_used_to_produce_batch')
					.aliased(t_ingredient, 'name', 'ingredient_name')
					.aliased(t_ingredient, 'unit', 'ingredient_unit')
					.build()
			})
			.from(t_ingredient_batch)
			.innerJoin(t_ingredient, eq(t_ingredient.id, t_ingredient_batch.ingredient_id))
			.innerJoin(
				tr_ingredient_batch_ingredient_batch,
				eq(tr_ingredient_batch_ingredient_batch.produced_batch_id, t_ingredient_batch.id)
			)
			.innerJoin(
				ta_used_batch,
				eq(tr_ingredient_batch_ingredient_batch.used_batch_id, ta_used_batch.id)
			)
			.innerJoin(ta_used_ingredient, eq(ta_used_batch.ingredient_id, ta_used_ingredient.id))
			.where(eq(t_ingredient_batch.state, 'IN_PRODUCTION'))
			.then(
				drizzle_map({
					one: 't_ingredient_batch',
					with_one: ['ingredient', 'used_ingredient'],
					with_many: ['used_batches']
				})
			);
	}

	async closeProduction(obj: { batch_id: number; adjustment: number }) {
		const { batch_id, adjustment } = obj;
		return this.db.transaction(async (tx) => {
			const batch = await tx
				.select()
				.from(t_ingredient_batch)
				.where(
					and(eq(t_ingredient_batch.id, batch_id), eq(t_ingredient_batch.state, 'IN_PRODUCTION'))
				)
				.then(getFirstIfPosible);
			if (!batch) {
				return logic_error('batch not found');
			}

			await tx
				.update(t_ingredient_batch)
				.set({
					production_date: new Date(),
					state: 'AVAILABLE',
					adjustment
				})
				.where(eq(t_ingredient_batch.id, batch_id));
			return { type: 'SUCCESS' } as const;
		});
	}

	async deleteBatchById(id: number) {
		const found = await database
			.select()
			.from(t_ingredient_batch)
			.where(eq(t_ingredient_batch.id, id))
			.then((x) => Boolean(x.length));

		if (!found) {
			return logic_error('lote no encontrado');
		}

		await database
			.delete(tr_ingredient_batch_ingredient_batch)
			.where(eq(tr_ingredient_batch_ingredient_batch.produced_batch_id, id));

		await this.db.delete(t_ingredient_batch).where(eq(t_ingredient_batch.id, id));

		return { type: 'SUCCESS' } as const;
	}

	async deleteIngredientProduction(id: number) {
		const list = await database
			.select()
			.from(t_ingredient_batch)
			.where(and(eq(t_ingredient_batch.id, id), eq(t_ingredient_batch.state, 'IN_PRODUCTION')));
		if (list.length !== 1) {
			return logic_error('batch is not in porduction');
		}
		return this.db.transaction(async (tx) => {
			await tx
				.delete(tr_ingredient_batch_ingredient_batch)
				.where(eq(tr_ingredient_batch_ingredient_batch.produced_batch_id, id));
			await tx.delete(t_ingredient_batch).where(eq(t_ingredient_batch.id, id));
			return is_ok(null);
		});
	}

	async modifyStock({ batch_id, adjustment }: { batch_id: number; adjustment: number }) {
		return await this.db.transaction(async (tx) => {
			const batch = await this.db
				.select()
				.from(t_ingredient_batch)
				.where(eq(t_ingredient_batch.id, batch_id))
				.then(getFirstIfPosible);
			if (!batch) {
				return logic_error('lote no existe');
			}

			await tx
				.update(t_ingredient_batch)
				.set({ adjustment: Number(batch.adjustment) + adjustment })
				.where(eq(t_ingredient_batch.id, batch_id));
			return is_ok(null);
		});
	}
}

export const ingredient_production_service = new IngredientProductionService(database);

