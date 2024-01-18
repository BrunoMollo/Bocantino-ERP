import { getFirst, getFirstIfPosible } from '$lib/utils';
import { eq } from 'drizzle-orm';
import { db, type Db } from '../db';
import { t_ingredient, t_product, tr_ingredient_product } from '../db/schema';
import { pick_merge } from 'drizzle-tools/src/pick-columns';
import { is_ok, logicError } from '$logic';

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
					.table(t_ingredient, 'id', 'name', 'unit')
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
		produced_amount: number;
		batches_ids: number[];
	}) {
		const { product_id, produced_amount, batches_ids } = obj;

		const product_exists = await this.db
			.select()
			.from(t_product)
			.where(eq(t_product.id, product_id))
			.then(getFirstIfPosible)
			.then(Boolean);

		if (!product_exists) {
			return logicError('producto no existe');
		}

		await this.db.transaction(async (tx) => {
			return 12;
		});

		return is_ok(null);
	}
}

export const product_service = new ProductService(db);

