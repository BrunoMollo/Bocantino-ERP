import { redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createForm, supplier_schema } from '../../_components/shared';
import { superValidate } from 'sveltekit-superforms/server';
import { suppliers_service } from '$logic/suppliers-service';
import { ingredients_service } from '$logic/ingredient-service';
import { parse_id_param, should_not_reach } from '$lib/utils';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = parse_id_param(params);

	const supplier = await suppliers_service.getById(id);
	if (!supplier) {
		throw error(400, 'proveedor no existe');
	}
	const ingredients = await ingredients_service.getAll();

	const form = createForm();
	return { ingredients, form, supplier };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const { id } = parse_id_param(params);
		const supplier = await suppliers_service.getById(id);
		if (!supplier) {
			throw error(400, 'proveedor no existe');
		}

		const form = await superValidate(request, supplier_schema);
		if (!form.valid) {
			return { form };
		}

		const res = await suppliers_service.edit(id, form.data);

		switch (res.type) {
			case 'SUCCESS':
				throw redirect(302, '/bocantino/proveedores?toast=Proveedor editado');
			default:
				should_not_reach(res.type);
		}
	}
};
