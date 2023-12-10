import type { PageServerLoad } from './$types';
import { db } from '$lib';
import type { Actions } from '@sveltejs/kit';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';

const newBagsSchema = z.object({
	bags: z
		.object({
			supplierId: z.number().positive().int(),
			ingredientId: z.number().positive().int(),
			supplier_batch_code: z.string().min(2).max(256),
			autoGenerateCode: z.boolean(),
			fullAmount: z.number().positive()
		})
		.array()
		.nonempty()
});

export const load: PageServerLoad = async ({}) => {
	// const resultSet = await db.query.tr_supplier_ingredient.findMany({
	// 	columns: { ingredientId: false, supplierId: false },
	// 	with: {
	// 		ingredient: true,
	// 		supplier: true
	// 	}
	// });
	//
	// const list = [] as {
	// 	supplier: {
	// 		id: number;
	// 		name: string;
	// 		email: string;
	// 	};
	// }[];
	// for (let row of resultSet) {
	// 	const supplier = list.find((x) => x.supplier.id === row.supplier.id) ?? row.supplier;
	// }
	//

	const EMPTY_BAG = {
		supplierId: 0,
		ingredientId: 0,
		supplier_batch_code: '',
		autoGenerateCode: false,
		fullAmount: 0
	};
	const form = superValidate({ bags: [EMPTY_BAG] }, newBagsSchema);
	return { form, EMPTY_BAG };
};

export const actions: Actions = {
	default: async ({ request }) => {
		console.log('recived');
		//	await db.insert(t_ingredient_bag).values(data);

		console.log(':)');
	}
};
