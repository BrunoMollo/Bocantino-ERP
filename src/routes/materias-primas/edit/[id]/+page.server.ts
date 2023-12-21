import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, RouteParams, Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { t_ingredient } from '$lib/server/db/schema';
import * as ingredients_service from '$lib/server/logic/ingredients';
import { createForm, ingredient_schema } from '../../_components/shared';
import { superValidate } from 'sveltekit-superforms/server';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = parseParams(params);
	const ingredient = await ingredients_service.getById(id);

	if (!ingredient) {
		throw error(400, { message: 'invalid id' });
	}
	const { name, unit } = ingredient;
	const form = createForm({ name, unit });

	return { form };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const { id } = parseParams(params);

		const form = await superValidate(request, ingredient_schema);
		if (!form.valid) {
			return { form };
		}
		await db.update(t_ingredient).set(form.data).where(eq(t_ingredient.id, id));

		throw redirect(302, '/materias-primas?toast=Editado con exito');
	}
};

function parseParams(params: RouteParams) {
	const id = Number(params.id);
	if (isNaN(id)) {
		throw error(400, { message: 'invalid id' });
	}
	return { id };
}
