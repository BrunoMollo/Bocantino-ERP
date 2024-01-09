import { ingredient_production_service } from '$logic';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/client';

const close_production_schema = z.object({
	expiration_date: z.coerce.date(),
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
		return { form };
	}
};

