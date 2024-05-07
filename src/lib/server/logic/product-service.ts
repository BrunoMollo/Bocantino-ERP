import { generateUUID, getFirst, getFirstIfPosible } from '$lib/utils';
import { eq, and, ilike, count } from 'drizzle-orm';
import { db, type Db } from '../db';
import {
	t_ingredient,
	t_ingredient_batch,
	t_product,
	t_product_batch,
	tr_ingredient_product,
	tr_product_batch_ingredient_batch
} from '../db/schema';
import { pick_columns, pick_merge } from 'drizzle-tools/src/pick-columns';
import { is_ok, logic_error } from '$logic';
import moment from 'moment';
import { drizzle_map } from 'drizzle-tools';
import { ingredient_production_service } from './ingredient-production-service';

class ProductService {
	async edit(
		product_id: number,
		data: {
			desc: string;
			ingredients: { ingredient_id: number; amount: number }[];
		}
	) {
		await this.db.transaction(async (tx) => {
			await tx.update(t_product).set({ desc: data.desc }).where(eq(t_product.id, product_id));
			await tx.delete(tr_ingredient_product).where(eq(tr_ingredient_product.productId, product_id));
			for (const { ingredient_id, amount } of data.ingredients) {
				await tx.insert(tr_ingredient_product).values({
					productId: product_id,
					ingredient_id,
					amount
				});
			}
		});
		return is_ok(null);
	}
	async getById(product_id: number) {
		return await this.db
			.select({
				t_product,
				ingredients: pick_merge()
					.table(tr_ingredient_product, 'ingredient_id', 'amount')
					.aliased(tr_ingredient_product, 'ingredient_id', 'id') //internal for drizzle_map
					.build()
			})
			.from(t_product)
			.innerJoin(tr_ingredient_product, eq(tr_ingredient_product.productId, t_product.id))
			.where(eq(t_product.id, product_id))
			.then(drizzle_map({ one: 't_product', with_one: [], with_many: ['ingredients'] }))
			.then(getFirstIfPosible);
	}
	constructor(private db: Db) {}

	public PAGE_SIZE = 10;
	async getBatchesAvailable(filter: { page: number; batch_code: string; ingredient_name: string }) {
		const { page, batch_code, ingredient_name } = filter;

		const limited_batches = this.db.$with('limited_products_batches').as(
			db
				.select()
				.from(t_product_batch)
				.where(eq(t_product_batch.state, 'AVAILABLE'))
				.limit(this.PAGE_SIZE)
				.offset(page * this.PAGE_SIZE)
		);
		return await db
			.with(limited_batches)
			.select({
				batch: pick_columns(
					limited_batches,
					'id',
					'batch_code',
					'state',
					'production_date',
					'expiration_date'
				),
				product: pick_columns(t_product, 'id', 'desc')
			})
			.from(limited_batches)
			.innerJoin(t_product, eq(limited_batches.product_id, t_product.id))
			.innerJoin(
				tr_product_batch_ingredient_batch,
				eq(tr_product_batch_ingredient_batch.produced_batch_id, limited_batches.id)
			)
			.innerJoin(
				t_ingredient_batch,
				eq(tr_product_batch_ingredient_batch.ingredient_batch_id, t_ingredient_batch.id)
			)
			.innerJoin(t_ingredient, eq(t_ingredient_batch.ingredient_id, t_ingredient.id))
			.where(
				and(
					eq(limited_batches.state, 'AVAILABLE'),
					ilike(t_product.desc, `%${ingredient_name}%`),
					ilike(t_ingredient_batch.batch_code, `%${batch_code}%`)
				)
			)
			.then(drizzle_map({ one: 'batch', with_one: ['product'], with_many: [] }));
	}

	async deleteBatchById(batch_id: number) {
		const batch_exists = await this.isBatchInProduction(batch_id);
		if (!batch_exists) {
			return logic_error('lote indicado no existe');
		}

		await this.db.transaction(async (tx) => {
			await tx
				.delete(tr_product_batch_ingredient_batch)
				.where(eq(tr_product_batch_ingredient_batch.produced_batch_id, batch_id));
			await tx.delete(t_product_batch).where(eq(t_product_batch.id, batch_id));
		});
		return is_ok(null);
	}

	private async isBatchInProduction(batch_id: number) {
		return await this.db
			.select()
			.from(t_product_batch)
			.where(and(eq(t_product_batch.id, batch_id), eq(t_product_batch.state, 'IN_PRODUCTION')))
			.then(getFirstIfPosible)
			.then(Boolean);
	}

	async closeProduction(data: { batch_id: number; adjustment: number }) {
		const { batch_id, adjustment } = data;

		const batch_exists = await this.isBatchInProduction(batch_id);
		if (!batch_exists) {
			return logic_error('lote indicado no existe');
		}

		await this.db.transaction(async (tx) => {
			await tx
				.update(t_product_batch)
				.set({ state: 'AVAILABLE', adjustment, production_date: new Date() })
				.where(eq(t_product_batch.id, batch_id));
		});

		return is_ok(null);
	}

	private async product_exists(product_id: number) {
		return await this.db
			.select()
			.from(t_product)
			.where(eq(t_product.id, product_id))
			.limit(1)
			.then(getFirstIfPosible)
			.then(Boolean);
	}

	async getAll() {
		return await this.db.select().from(t_product);
	}

	async add({
		desc,
		ingredients
	}: {
		desc: string;
		ingredients: { ingredient_id: number; amount: number }[];
	}) {
		return await this.db.transaction(async (tx) => {
			const inserted = await tx
				.insert(t_product)
				.values({ desc })
				.returning({ id: t_product.id })
				.then(getFirst);

			for (const { ingredient_id, amount } of ingredients) {
				await tx.insert(tr_ingredient_product).values({
					ingredient_id,
					productId: inserted.id,
					amount
				});
			}
			return inserted;
		});
	}

	async getRecipie(product_id: number) {
		return await this.db
			.select(
				pick_merge()
					.aliased(t_ingredient, 'id', 'ingredient_id')
					.aliased(t_ingredient, 'name', 'ingredient_name')
					.aliased(t_ingredient, 'unit', 'ingredient_unit')
					.table(tr_ingredient_product, 'amount')
					.build()
			)
			.from(tr_ingredient_product)
			.where(eq(tr_ingredient_product.productId, product_id))
			.innerJoin(t_ingredient, eq(tr_ingredient_product.ingredient_id, t_ingredient.id));
	}

	async startProduction(obj: {
		product_id: number;
		recipe: {
			amount: number;
			ingredient_id: number;
		}[];
		produced_amount: number;
		batches_ids: number[][];
	}) {
		const { product_id, produced_amount, recipe, batches_ids } = obj;

		const product_exists = await this.product_exists(product_id);

		if (!product_exists) {
			return logic_error('producto no existe');
		}

		return await this.db.transaction(async (tx) => {
			const get_needed_amount = (ingredient_id: number) =>
				recipe
					.filter((x) => x.ingredient_id === ingredient_id)
					.map((x) => x.amount * produced_amount)[0] ?? 0;

			type Batch = Awaited<ReturnType<typeof ingredient_production_service.getBatchesByIds>>;
			const all_batches = [] as Batch[];

			for (const batches_ids_with_same_ingredient of batches_ids) {
				const batches = await ingredient_production_service.getBatchesByIds(
					batches_ids_with_same_ingredient,
					tx
				);
				all_batches.push(batches);

				if (batches.length !== batches_ids_with_same_ingredient.length) {
					return logic_error(
						'no se encontro alguon de los siguientes lotes por id ' +
							JSON.stringify(batches_ids_with_same_ingredient)
					);
				}

				const are_same_ingredient = [...new Set(batches.map((x) => x.ingredient.id))].length === 1;
				if (!are_same_ingredient) {
					return logic_error('los lotes agrupados no son del mismo ingrediente');
				}

				const available_amount = batches.map((x) => x.stock).reduce((x, y) => x + y, 0);
				const needed_amount = get_needed_amount(batches[0].ingredient.id);

				if (available_amount < needed_amount) {
					return logic_error(
						'stock insuficiente de ingrediente ' +
							batches[0].ingredient.name +
							JSON.stringify({ needed_amount, given: batches.map((x) => x.stock) })
					);
				}
			}
			const get_expiration_date = () => {
				const today = moment();
				return moment(today).add(6, 'month').toDate();
			};

			const inserted = await tx
				.insert(t_product_batch)
				.values({
					batch_code: generateUUID(), //defualt
					initial_amount: produced_amount,
					expiration_date: get_expiration_date(),
					production_date: null,
					product_id,
					state: 'IN_PRODUCTION'
				})
				.returning({ id: t_product_batch.id })
				.then(getFirst);

			const batch_code = 'BOC' + inserted.id.toString().padStart(10, '0');
			await tx
				.update(t_product_batch)
				.set({ batch_code })
				.where(eq(t_product_batch.id, inserted.id));

			//use first the one that have less stock
			all_batches.forEach((arr) => arr.sort((a, b) => a.stock - b.stock));

			for (const batch_group of all_batches) {
				let asigned_amount = 0;
				const missing = () => get_needed_amount(batch_group[0].ingredient.id) - asigned_amount;
				for (const { id: ingredient_batch_id, stock } of batch_group) {
					const amount_used_to_produce_batch = missing() > stock ? stock : missing();
					asigned_amount += amount_used_to_produce_batch;

					await tx.insert(tr_product_batch_ingredient_batch).values({
						produced_batch_id: inserted.id,
						ingredient_batch_id,
						amount_used_to_produce_batch
					});
				}
			}
			return is_ok(inserted);
		});
	}
	async getProductBatchByID(id: number) {
		return await db
			.select({
				batch: pick_columns(
					t_product_batch,
					'id',
					'batch_code',
					'state',
					'production_date',
					'expiration_date',
					'initial_amount',
					'adjustment'
				),
				product: pick_columns(t_product, 'id', 'desc'),
				used_batches: pick_merge()
					.table(t_ingredient_batch, 'id', 'batch_code')
					.table(tr_product_batch_ingredient_batch, 'amount_used_to_produce_batch')
					.aliased(t_ingredient, 'name', 'ingredient_name')
					.build()
			})
			.from(t_product_batch)
			.innerJoin(t_product, eq(t_product_batch.product_id, t_product.id))
			.innerJoin(
				tr_product_batch_ingredient_batch,
				eq(tr_product_batch_ingredient_batch.produced_batch_id, t_product_batch.id)
			)
			.innerJoin(
				t_ingredient_batch,
				eq(tr_product_batch_ingredient_batch.ingredient_batch_id, t_ingredient_batch.id)
			)
			.innerJoin(t_ingredient, eq(t_ingredient_batch.ingredient_id, t_ingredient.id))
			.where(eq(t_product_batch.id, id))
			.then(drizzle_map({ one: 'batch', with_one: ['product'], with_many: ['used_batches'] }))
			.then(getFirstIfPosible);
	}

	async getBatchesInProduction() {
		return await db
			.select({
				product_batch: pick_columns(t_product_batch, 'id', 'batch_code', 'initial_amount'),
				used_batches: pick_merge()
					.table(t_ingredient_batch, 'id', 'batch_code')
					.table(tr_product_batch_ingredient_batch, 'amount_used_to_produce_batch')
					.aliased(t_ingredient, 'name', 'ingredient_name')
					.aliased(t_ingredient, 'unit', 'ingredient_unit')
					.build(),
				product: pick_columns(t_product, 'id', 'desc')
			})
			.from(t_product_batch)
			.where(eq(t_product_batch.state, 'IN_PRODUCTION'))
			.innerJoin(t_product, eq(t_product.id, t_product_batch.product_id))
			.innerJoin(
				tr_product_batch_ingredient_batch,
				eq(tr_product_batch_ingredient_batch.produced_batch_id, t_product_batch.id)
			)
			.innerJoin(
				t_ingredient_batch,
				eq(tr_product_batch_ingredient_batch.ingredient_batch_id, t_ingredient_batch.id)
			)
			.innerJoin(t_ingredient, eq(t_ingredient_batch.ingredient_id, t_ingredient.id))
			.then(
				drizzle_map({ one: 'product_batch', with_many: ['used_batches'], with_one: ['product'] })
			);
	}
	async getLastBatchesInProduction() {
		return await db
			.select({
				product_batch: pick_columns(t_product_batch, 'id', 'batch_code', 'initial_amount'),
				used_batches: pick_merge()
					.table(t_ingredient_batch, 'id', 'batch_code')
					.table(tr_product_batch_ingredient_batch, 'amount_used_to_produce_batch')
					.aliased(t_ingredient, 'name', 'ingredient_name')
					.aliased(t_ingredient, 'unit', 'ingredient_unit')
					.build(),
				product: pick_columns(t_product, 'id', 'desc')
			})
			.from(t_product_batch)
			.where(eq(t_product_batch.state, 'IN_PRODUCTION'))
			.innerJoin(t_product, eq(t_product.id, t_product_batch.product_id))
			.innerJoin(
				tr_product_batch_ingredient_batch,
				eq(tr_product_batch_ingredient_batch.produced_batch_id, t_product_batch.id)
			)
			.innerJoin(
				t_ingredient_batch,
				eq(tr_product_batch_ingredient_batch.ingredient_batch_id, t_ingredient_batch.id)
			)
			.innerJoin(t_ingredient, eq(t_ingredient_batch.ingredient_id, t_ingredient.id))
			.limit(5)
			.then(
				drizzle_map({ one: 'product_batch', with_many: ['used_batches'], with_one: ['product'] })
			);
	}
	async getBatchById(id: number) {
		return await db
			.select({
				batch: pick_columns(
					t_product_batch,
					'id',
					'batch_code',
					'state',
					'production_date',
					'expiration_date',
					'initial_amount'
				),
				product: pick_columns(t_product, 'id', 'desc'),
				used_batches: pick_merge()
					.table(t_ingredient_batch, 'id', 'batch_code')
					.table(tr_product_batch_ingredient_batch, 'amount_used_to_produce_batch')
					.aliased(t_ingredient, 'name', 'ingredient_name')
					.aliased(t_ingredient, 'unit', 'ingredient_unit')
					.build()
			})
			.from(t_product_batch)
			.innerJoin(t_product, eq(t_product_batch.product_id, t_product.id))
			.innerJoin(
				tr_product_batch_ingredient_batch,
				eq(tr_product_batch_ingredient_batch.produced_batch_id, t_product_batch.id)
			)
			.innerJoin(
				t_ingredient_batch,
				eq(tr_product_batch_ingredient_batch.ingredient_batch_id, t_ingredient_batch.id)
			)
			.innerJoin(t_ingredient, eq(t_ingredient_batch.ingredient_id, t_ingredient.id))
			.where(eq(t_product_batch.id, id))
			.then(drizzle_map({ one: 'batch', with_one: ['product'], with_many: ['used_batches'] }))
			.then(getFirstIfPosible);
	}

	async getCountOfAvailableBatches() {
		return await db
			.select({
				value: count(t_product_batch.id)
			})
			.from(t_product_batch)
			.where(eq(t_product_batch.state, 'AVAILABLE'))
			.then((x) => x[0]?.value);
	}
}

export const product_service = new ProductService(db);
