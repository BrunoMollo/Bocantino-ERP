import { superValidate } from 'sveltekit-superforms/client';
import { z } from 'zod';
import type { PageServerLoad, RouteParams } from './$types';
import { error, type Actions } from '@sveltejs/kit';
import { ingredient_production_service } from '$logic/ingredient-production-service';

const close_production_schema = z.object({
	batch_id: z.coerce.number().int().positive(),
	adjustment: z.number()
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
	const form = superValidate(close_production_schema);
	const cancel_form = superValidate(cancel_production_schema);
	return { batch, used_batch, form, cancel_form };
};

function parse_id_param(params: RouteParams) {
	const id = Number(params.id);
	if (isNaN(id) || id < 0) {
		throw error(400, { message: 'invalid id' });
	}
	return { id };
}

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
