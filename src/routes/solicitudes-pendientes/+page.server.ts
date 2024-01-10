import { ingredient_production_service } from '$logic';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/client';
import { isValidDateBackend, parseStringToDate } from '$lib/utils';
import { error } from '@sveltejs/kit';

const close_production_schema = z.object({
	expiration_date: z.string().refine(isValidDateBackend).transform(parseStringToDate),
	batch_id: z.coerce.number().int().positive(),
	loss: z.coerce.number().min(0)
});
export const load: PageServerLoad = async () => {
	const form = superValidate(close_production_schema);
	const pending_productions = await ingredient_production_service.getBatchesInProduction();
	return { form, pending_productions };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, close_production_schema);
		if (!form.valid) {
			return { form };
		}
		console.log(form.data);
		const res = await ingredient_production_service.closeProduction(form.data);
		if (res.type == 'LOGIC_ERROR') {
			throw error(400, res.message);
		}
		return { form };
	}
};

