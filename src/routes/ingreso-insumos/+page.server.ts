import type { PageServerLoad } from './$types';
import { db } from '$lib';
import type { Actions } from '@sveltejs/kit';
import { t_ingredient_bag } from '$lib/server/schema';

export const load: PageServerLoad = async ({}) => {
	// const list = db.query.tr_supplier_ingredient.findMany({
	// 	columns: { ingredientId: false, supplierId: false },
	// 	with: {
	// 		ingredient: true,
	// 		supplier: true
	// 	}
	// });
	// return { list };
};

export const actions: Actions = {
	default: async ({ request }) => {
		console.log('recived');
		const data = {
			supplierId: 6,
			ingredientId: 31
		};
		console.log(data);
		await db.insert(t_ingredient_bag).values(data);

		console.log(':)');
	}
};
