import { redirect, type Actions } from '@sveltejs/kit';
import { backendValidate } from 'zod-actions';
import { ingredient_schema } from '../ingredient_schema';
import * as ingredients_ctrl from '$lib/logic/ingredients';

export const actions: Actions = {
	default: async ({ request }) => {
		const { failure, data } = await backendValidate(ingredient_schema, request);
		if (failure) return failure;

		await ingredients_ctrl.add(data);

		throw redirect(302, '/materias-primas?toast=Materia prima agregada con exito');
	}
};

