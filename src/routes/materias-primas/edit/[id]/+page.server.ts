import { db } from '$lib';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, RouteParams, Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { backendValidate } from 'zod-actions';
import { t_ingredient } from '$lib/server/schema';
import { ingredient_schema } from '../../ingredient_schema';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = parseParams(params);
	const list = await db.select().from(t_ingredient).where(eq(t_ingredient.id, id));

	if (list.length === 0) {
		throw error(400, { message: 'invalid id' });
	}

	return { tipoMateriaPrima: list[0] };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const { failure, data } = await backendValidate(ingredient_schema, request);
		if (failure) return failure;

		const { id } = parseParams(params);

		await db.update(t_ingredient).set(data).where(eq(t_ingredient.id, id));

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
