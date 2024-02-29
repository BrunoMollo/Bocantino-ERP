import { z } from 'zod';
import type { PageServerLoad, RouteParams } from './$types';
import { superValidate } from 'sveltekit-superforms/client';
import { error, type Actions, redirect } from '@sveltejs/kit';
import { product_service } from '$logic/product-service';
import { should_not_reach } from '$lib/utils';

const close_production_schema = z.object({
	batch_id: z.coerce.number().int().positive(),
	adjustment: z.number()
});

const cancel_production_schema = z.object({
	batch_id: z.coerce.number().int().positive()
});

export const load: PageServerLoad = async ({ params }) => {
	const { id } = parse_id_param(params);

	const batch = product_service.getBatchById(id);

	const form = superValidate({ batch_id: id, adjustment: 0 }, close_production_schema);
	const cancel_form = superValidate({ batch_id: id }, cancel_production_schema);

	return { form, cancel_form, batch };
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
		const res = await product_service.closeProduction(form.data);
		if (res.type == 'LOGIC_ERROR') {
			throw error(400, res.message);
		}
		throw redirect(302, '/bocantino/solicitudes-pendientes/productos');
	},

	cancel: async ({ request }) => {
		const form = await superValidate(request, cancel_production_schema);
		if (!form.valid) {
			return { form };
		}
		const { batch_id } = form.data;
		const res = await product_service.deleteBatchById(batch_id);

		switch (res.type) {
			case 'LOGIC_ERROR':
				throw error(400, res.message);
			case 'SUCCESS':
				throw redirect(302, '/bocantino/solicitudes-pendientes/productos');
			default:
				should_not_reach(res);
		}
	}
};

