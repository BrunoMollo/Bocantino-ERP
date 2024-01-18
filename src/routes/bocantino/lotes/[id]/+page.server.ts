import { ingredient_production_service } from '$logic';
import { z } from 'zod';
import type { PageServerLoad } from './$types';
import { error, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/client';

const accidental_adjustment_schema = z.object({
	adjustment: z.coerce.number().positive()
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
	default: async ({ request }) => {
		const form = await superValidate(request, accidental_adjustment_schema);
		if (!form.valid) {
			return { form };
		}
		console.log(form.data);

		return { form };
	}
};

