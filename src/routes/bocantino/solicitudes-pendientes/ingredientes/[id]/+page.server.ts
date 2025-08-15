import { message, superValidate } from 'sveltekit-superforms/client';
import { z } from 'zod';
import type { PageServerLoad } from './$types';
import { error, type Actions, redirect } from '@sveltejs/kit';
import { ingredient_production_service } from '$logic/ingredient-production-service';
import { parse_id_param, should_not_reach } from '$lib/utils';

const close_production_schema = z.object({
	batch_id: z.coerce.number().int().positive(),
	real_production: z.number().positive()
});

const cancel_production_schema = z.object({
	batch_id: z.coerce.number().int().positive()
});

export const load: PageServerLoad = async ({ params }) => {
	const { id } = parse_id_param(params);
	const batch = await ingredient_production_service.getBatchById(id);
	const used_batch = await ingredient_production_service.getUsedBatchOf({ id });
	if (!batch || !used_batch) {
		throw error(404, 'lote derivado no existe');
	}
	const form = superValidate({ batch_id: id }, close_production_schema, { errors: false });
	const cancel_form = superValidate({ batch_id: id }, cancel_production_schema);
	return { batch, used_batch, form, cancel_form };
};

export const actions: Actions = {
	finish: async ({ request }) => {
		const form = await superValidate(request, close_production_schema);
		if (!form.valid) {
			return { form };
		}

		const { batch_id, real_production } = form.data;

		const batch = await ingredient_production_service.getBatchById(batch_id);

		if (!batch) {
			throw error(404, 'lote derivado no existe');
		}

		const res = await ingredient_production_service.closeProduction({
			batch_id,
			adjustment: real_production - batch.initial_amount
		});

		switch (res.type) {
			case 'LOGIC_ERROR':
				throw error(400, res.message);
			case 'SUCCESS':
                
                return message(form, { 
                    type: 'success', 
                    batch: batch
                });
			default:
				should_not_reach(res);
		}
	},

	cancel: async ({ request }) => {
		const form = await superValidate(request, cancel_production_schema);
		if (!form.valid) {
			return { form };
		}
		const { batch_id } = form.data;
		const res = await ingredient_production_service.deleteBatchById(batch_id);

		switch (res.type) {
			case 'LOGIC_ERROR':
				throw error(400, res.message);
			case 'SUCCESS':
				throw redirect(302, '/bocantino/solicitudes-pendientes/ingredientes');
			default:
				should_not_reach(res);
		}
	}
};
