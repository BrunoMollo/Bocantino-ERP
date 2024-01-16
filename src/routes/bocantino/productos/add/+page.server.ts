import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/server';
import { product_schema } from '../_shared/zodSchema';
import { ingredients_service } from '$logic';
import { product_service } from '$logic/product-logic';

export const load: PageServerLoad = async () => {
	const form = superValidate(product_schema);
	const ingredients = await ingredients_service.getAll();
	return { ingredients, form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, product_schema);
		if (!form.valid) {
			return { form };
		}

		product_service.add(form.data);

		throw redirect(302, '/bocantino/productos?toast=Producto agregado');
	}
};

