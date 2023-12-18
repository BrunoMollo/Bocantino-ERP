import { redirect, type Actions } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
import { createForm, ingredient_schema } from '../_components/shared';
import { superValidate } from 'sveltekit-superforms/server';
import * as ingredients_ctrl from '$lib/server/logic/ingredients';

export const load: PageServerLoad = async () => {
	const form = createForm();
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, ingredient_schema);
		if (!form.valid) {
			return { form };
		}

		await ingredients_ctrl.add(form.data);

		throw redirect(302, '/materias-primas?toast=Materia prima agregada con exito');
	}
};

