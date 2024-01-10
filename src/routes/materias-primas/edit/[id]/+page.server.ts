import type { PageServerLoad, RouteParams, Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { createForm, ingredient_schema } from '../../_components/shared';
import { superValidate } from 'sveltekit-superforms/server';
import { ingredients_service } from '$logic';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = parseParams(params);

	const ingredient = await ingredients_service.getById(id);
	const source = await ingredients_service.getRecipie(id).then((x) => {
		if (x) {
			return { id: x.source.id, amount: x.amount };
		}
	});

	if (!ingredient) {
		throw error(400, { message: 'invalid id' });
	}
	const form = createForm({ ...ingredient, source });
	const ingredients = await ingredients_service
		.getAll()
		.then((arr) => arr.filter((x) => x.id != id));

	return { form, ingredients };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const { id } = parseParams(params);

		const form = await superValidate(request, ingredient_schema);
		if (!form.valid) {
			return { form };
		}
		await ingredients_service.edit(id, form.data, form.data.source);

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

