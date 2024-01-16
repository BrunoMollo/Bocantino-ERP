import { getFirst } from '$lib/utils';
import { db, type Db } from '../db';
import { t_product, tr_ingredient_product } from '../db/schema';

class ProductService {
	constructor(private db: Db) {}

	async add({
		desc,
		ingredients
	}: {
		desc: string;
		ingredients: { id: number; amount: number }[];
	}) {
		await this.db.transaction(async (tx) => {
			const { generatedId } = await tx
				.insert(t_product)
				.values({ desc })
				.returning({ generatedId: t_product.id })
				.then(getFirst);

			for (const { id, amount } of ingredients) {
				await tx.insert(tr_ingredient_product).values({
					ingredientId: id,
					productId: generatedId,
					amount
				});
			}
		});
	}
}

export const product_service = new ProductService(db);

