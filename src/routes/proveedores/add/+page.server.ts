import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';
import * as ingredients_ctrl from '$lib/server/logic/ingredients';
import * as suppliers_ctrl from '$lib/server/logic/suppliers';
import { createForm, supplier_schema } from '../_components/shared';
import { superValidate } from 'sveltekit-superforms/server';

export const load: PageServerLoad = async () => {
	const ingredients = await ingredients_ctrl.getAll();
	const form = createForm();
	return { ingredients, form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, supplier_schema);
		if (!form.valid) {
			return { form };
		}

		await suppliers_ctrl.add(form.data);

		throw redirect(302, '/proveedores?toast=Proveedor registrado');
	}
};
