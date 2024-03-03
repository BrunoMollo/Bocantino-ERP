import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/client';
import { product_service } from '$logic/product-service';
import { should_not_reach } from '$lib/utils';
import { error, redirect } from '@sveltejs/kit';
import { ingredients_service } from '$logic/ingredient-service';

const production_product_schema = z.object({
	product_id: z.coerce.number().int().positive(),
	produced_amount: z.coerce.number().positive(),
	recipe: z.array(
		z.object({
			amount: z.number().positive(),
			ingredient_id: z.number().int().positive()
		})
	),
	batches_ids: z.coerce.number().positive().array().nonempty().array().nonempty()
});

export const load: PageServerLoad = async () => {
	const form = superValidate(production_product_schema);
	const products = await product_service.getAll();
	const ingredients_all = await ingredients_service.getAll();
	return { form, products, ingredients_all };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, production_product_schema);
		if (!form.valid) {
			return { form };
		}

		const res = await product_service.startProduction(form.data);

		switch (res.type) {
			case 'LOGIC_ERROR':
				throw error(400, res.message);
			case 'SUCCESS':
				throw redirect(
					302,
					'/bocantino/solicitudes-pendientes/productos?toast=Produccion iniciada'
				);
			default:
				should_not_reach(res);
		}
	}
};

