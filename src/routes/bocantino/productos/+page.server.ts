import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { t_ingredient, t_product, tr_ingredient_product } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { copy_column, drizzle_map, pick_columns } from 'drizzle-tools';

export const load: PageServerLoad = async () => {
	const products = await db
		.select({
			product: pick_columns(t_product, ['id', 'desc']),
			ingredients: pick_columns(t_ingredient, ['id', 'name', 'unit']),
			r_ingredient_product: pick_columns(tr_ingredient_product, ['amount'])
		})
		.from(t_product)
		.leftJoin(tr_ingredient_product, eq(tr_ingredient_product.productId, t_product.id))
		.leftJoin(t_ingredient, eq(tr_ingredient_product.ingredientId, t_ingredient.id))
		.then(copy_column({ from: 'r_ingredient_product', field: 'amount', to: 'ingredients' }))
		.then(drizzle_map({ one: 'product', with_one: [], with_many: ['ingredients'] }));

	return { products };
};

