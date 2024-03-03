import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/client';
import { error } from '@sveltejs/kit';
import { ingredient_production_service } from '$logic/ingredient-production-service';

const close_production_schema = z.object({
	batch_id: z.coerce.number().int().positive(),
	adjustment: z.number()
});

const cancel_production_schema = z.object({
	batch_id: z.coerce.number().int().positive()
});

export const load: PageServerLoad = async () => {
	const form = superValidate(close_production_schema);
	const cancel_form = superValidate(cancel_production_schema);
	const pending_productions = await ingredient_production_service.getBatchesInProduction();
	return { form, cancel_form, pending_productions };
};

export const actions: Actions = {
	finish: async ({ request }) => {
		const form = await superValidate(request, close_production_schema);
		if (!form.valid) {
			return { form };
		}
		const res = await ingredient_production_service.closeProduction(form.data);
		if (res.type == 'LOGIC_ERROR') {
			throw error(400, res.message);
		}
		return { form };
	},

	cancel: async ({ request }) => {
		const form = await superValidate(request, cancel_production_schema);
		if (!form.valid) {
			return { form };
		}
		const { batch_id } = form.data;
		const res = await ingredient_production_service.deleteBatchById(batch_id);

		if (res.type == 'LOGIC_ERROR') {
			throw error(400, res.message);
		}

		return { form };
	}
};
