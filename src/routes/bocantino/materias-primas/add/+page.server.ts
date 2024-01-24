import { redirect, type Actions } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
import { createForm, ingredient_schema } from '../_components/shared';
import { superValidate } from 'sveltekit-superforms/server';
import { ingredients_service } from '$logic/ingredient-service';

export const load: PageServerLoad = async () => {
	const form = createForm();
	const ingredients = await ingredients_service.getAll();
	return { form, ingredients };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, ingredient_schema);
		if (!form.valid) {
			return { form };
		}
		const { source } = form.data;
		await ingredients_service.add(form.data, source ?? undefined);

		throw redirect(302, '/bocantino/materias-primas?toast=Materia prima agregada con exito');
	}
};

