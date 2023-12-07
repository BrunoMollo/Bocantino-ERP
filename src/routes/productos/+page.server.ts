import type { PageServerLoad } from './$types';
import { db } from '$lib';

export const load: PageServerLoad = async ({}) => {
	const resultSet = await db.query.t_product.findMany({
		with: {
			r_ingredient_product: {
				columns: {
					amount: true
				},
				with: { ingredient: true }
			}
		}
	});

	const products = resultSet.map(({ id, desc, r_ingredient_product }) => ({
		id,
		desc,
		ingredients: r_ingredient_product.map(({ amount, ingredient }) => ({
			id: ingredient.id,
			name: ingredient.name,
			unit: ingredient.unit,
			amount
		}))
	}));

	console.log(JSON.stringify(products));

	return { products };
};
