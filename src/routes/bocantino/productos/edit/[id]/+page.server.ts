import { redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad, RouteParams } from './$types';
import { superValidate } from 'sveltekit-superforms/server';
import { product_schema } from '../../_shared/zodSchema';
import { product_service } from '$logic/product-service';
import { ingredients_service } from '$logic/ingredient-service';
import { should_not_reach } from '$lib/utils';

export const load: PageServerLoad = async ({ params }) => {
	const form = await superValidate(product_schema);

	const { id } = parse_id_param(params);
	const product = await product_service.getById(id);
	if (!product) {
		throw error(400, 'producto no existe');
	}
	const ingredients = await ingredients_service.getAll();

	return { ingredients, form, product };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const form = await superValidate(request, product_schema);
		if (!form.valid) {
			return { form };
		}

		const { id } = parse_id_param(params);
		const product = await product_service.getById(id);
		if (!product) {
			throw error(400, 'producto no existe');
		}
		const res = await product_service.edit(id, form.data);

		switch (res.type) {
			case 'SUCCESS':
				throw redirect(302, '/bocantino/productos?toast=Producto editado');
			default:
				should_not_reach(res.type);
		}
	}
};

function parse_id_param(params: RouteParams) {
	const id = Number(params.id);
	if (isNaN(id) || id < 0) {
		throw error(400, { message: 'invalid id' });
	}
	return { id };
}

