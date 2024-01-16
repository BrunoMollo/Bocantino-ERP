import { z } from 'zod';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/client';
import { product_service } from '$logic/product-logic';
import { ingredients_service } from '$logic';

const production_product_schema = z.object({
	product_id: z.coerce.number().int().positive(),
	produced_amount: z.coerce.number().positive(),
	batches: z.coerce.number().positive().array().nonempty().array().nonempty()
});

export const load: PageServerLoad = async () => {
	const form = superValidate(production_product_schema);
	const products = await product_service.getAll();
	const ingredients_all = await ingredients_service.getAll();
	return { form, products, ingredients_all };
};

