import { getFirst, getFirstIfPosible } from '$lib/utils';
import { eq } from 'drizzle-orm';
import { db, type Db } from '../db';
import {
	t_ingredient,
	t_product,
	t_product_batch,
	tr_ingredient_product,
	tr_product_batch_ingredient_batch
} from '../db/schema';
import { pick_merge } from 'drizzle-tools/src/pick-columns';
import { ingredient_production_service, is_ok, logicError } from '$logic';
import moment from 'moment';

class ProductService {
	constructor(private db: Db) {}

	async getAll() {
		return await this.db.select().from(t_product);
	}

	async add({
		desc,
		ingredients
	}: {
		desc: string;
		ingredients: { id: number; amount: number }[];
	}) {
		return await this.db.transaction(async (tx) => {
			const inserted = await tx
				.insert(t_product)
				.values({ desc })
				.returning({ id: t_product.id })
				.then(getFirst);

			for (const { id, amount } of ingredients) {
				await tx.insert(tr_ingredient_product).values({
					ingredientId: id,
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
			.innerJoin(t_ingredient, eq(tr_ingredient_product.ingredientId, t_ingredient.id));
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

		const product_exists = await this.db
			.select()
			.from(t_product)
			.where(eq(t_product.id, product_id))
			.then(getFirstIfPosible)
			.then(Boolean);

		if (!product_exists) {
			return logicError('producto no existe');
		}

		return await this.db.transaction(async (tx) => {
			const get_needed_amount = (ingredient_id: number) =>
				recipe
					.filter((x) => x.ingredient_id === ingredient_id)
					.map((x) => x.amount * produced_amount)[0];

			const all_batches = [] as Awaited<
				ReturnType<typeof ingredient_production_service.getBatchesByIds>
			>[];

			for (let batches_ids_with_same_ingredient of batches_ids) {
				const batches = await ingredient_production_service.getBatchesByIds(
					batches_ids_with_same_ingredient,
					tx
				);
				all_batches.push(batches);

				if (batches.length !== batches_ids_with_same_ingredient.length) {
					return logicError(
						'no se encontro alguon de los siguientes lotes por id ' +
							JSON.stringify(batches_ids_with_same_ingredient)
					);
				}

				const are_same_ingredient = [...new Set(batches.map((x) => x.ingredient.id))].length === 1;
				if (!are_same_ingredient) {
					return logicError('los lotes agrupados no son del mismo ingrediente');
				}

				const available_amount = batches.map((x) => x.stock).reduce((x, y) => x + y, 0);
				const needed_amount = get_needed_amount(batches[0].ingredient.id);

				if (available_amount < needed_amount) {
					return logicError(
						'stock insuficiente de ingrediente ' +
							batches[0].ingredient.name +
							JSON.stringify({ needed_amount, given: batches.map((x) => x.stock) })
					);
				}

				const stock_without_last = batches
					.slice(0, batches.length - 1)
					.map((x) => x.stock)
					.reduce((x, y) => x + y, 0);

				if (needed_amount < stock_without_last) {
					return logicError(
						'se indicaron mas batches de los necesarios, ids' +
							JSON.stringify(batches_ids_with_same_ingredient) +
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
					batch_code: 'DEFINE WITH CLIENT', //TODO: ask client when this is asigned
					initial_amount: produced_amount,
					expiration_date: get_expiration_date(),
					production_date: null,
					product_id,
					state: 'IN_PRODUCTION'
				})
				.returning({ id: t_product_batch.id })
				.then(getFirst);

			for (let batch_group of all_batches) {
				let asigned_amount = 0;
				const missing = () => get_needed_amount(batch_group[0].ingredient.id) - asigned_amount;
				for (let { id: ingredient_batch_id, stock } of batch_group) {
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
}

export const product_service = new ProductService(db);

