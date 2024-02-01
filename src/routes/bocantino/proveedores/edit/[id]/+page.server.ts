import { redirect, type Actions, error } from '@sveltejs/kit';
import type { PageServerLoad, RouteParams } from './$types';
import { createForm, supplier_schema } from '../../_components/shared';
import { superValidate } from 'sveltekit-superforms/server';
import { suppliers_service } from '$logic/suppliers-service';
import { ingredients_service } from '$logic/ingredient-service';

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
	default: async ({ request }) => {
		const form = await superValidate(request, supplier_schema);
		if (!form.valid) {
			return { form };
		}

		//TODO: edit

		throw redirect(302, '/bocantino/proveedores?toast=Proveedor editado');
	}
};

function parse_id_param(params: RouteParams) {
	const id = Number(params.id);
	if (isNaN(id) || id < 0) {
		throw error(400, { message: 'invalid id' });
	}
	return { id };
}

