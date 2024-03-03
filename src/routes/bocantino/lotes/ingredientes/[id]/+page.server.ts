import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/client';
import { ingredient_production_service } from '$logic/ingredient-production-service';
import { should_not_reach } from '$lib/utils';

const accidental_adjustment_schema = z.object({
	adjustment: z.number()
});

export const load: PageServerLoad = async (url) => {
	const id = Number(url.params.id);
	if (!id) {
		throw error(400, 'id invalido');
	}

	const form = superValidate(accidental_adjustment_schema);

	const batch = await ingredient_production_service.getBatchById(id);
	if (!batch) {
		throw error(400, 'id invalido');
	}

	return { form, batch };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const batch_id = Number(params.id);
		if (!batch_id) {
			throw error(400, 'id invalido');
		}
		const form = await superValidate(request, accidental_adjustment_schema);
		if (!form.valid) {
			return { form };
		}

		const { adjustment } = form.data;
		const res = await ingredient_production_service.modifyStock({ batch_id, adjustment });

		switch (res.type) {
			case 'LOGIC_ERROR':
				throw error(400, res.message);
			case 'SUCCESS':
				throw redirect(302, '/bocantino/lotes/ingredientes?toast=Stock modificado');
			default:
				should_not_reach(res);
		}
	}
};
