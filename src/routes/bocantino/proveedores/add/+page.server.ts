import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';
import { createForm, supplier_schema } from '../_components/shared';
import { superValidate } from 'sveltekit-superforms/server';
import { suppliers_service } from '$logic/suppliers-service';
import { ingredients_service } from '$logic/ingredient-service';

export const load: PageServerLoad = async () => {
	const ingredients = await ingredients_service.getAll();
	const form = createForm();
	return { ingredients, form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, supplier_schema);
		if (!form.valid) {
			return { form };
		}

		await suppliers_service.add(form.data);

		throw redirect(302, '/bocantino/proveedores?toast=Proveedor registrado');
	}
};

