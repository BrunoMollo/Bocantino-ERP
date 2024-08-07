import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/client';
import { isValidDateBackend, parseStringToDate, should_not_reach } from '$lib/utils';
import { error, redirect } from '@sveltejs/kit';
import { purchases_service } from '$logic/ingredient-purchase-service';
import type { LayoutRouteId } from '../../../$types';

const add_invoice_dto = z.object({
	invoice_number: z.string().min(4, 'Requerido').max(255),
	issue_date: z.string().refine(isValidDateBackend).transform(parseStringToDate),
	due_date: z.string().refine(isValidDateBackend).transform(parseStringToDate),
	withdrawal_tax_amount: z.number().min(0),
	iva_tax_percentage: z.coerce.number().min(0),
	batches: z
		.object({
			batch_id: z.number().positive().int(),
			cost: z.number().positive()
		})
		.array()
		.nonempty()
});

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	if (!id) {
		throw error(400, 'id invalido');
	}
	const entry = await purchases_service.getEntryById(id);
	if (!entry) {
		throw error(404, 'entrada no encontrada');
	}
	const form = superValidate(add_invoice_dto);
	const batches = await purchases_service.getBatchesByEntryId(id);
	return { form, entry, batches };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const form = await superValidate(request, add_invoice_dto);

		const entry_id = Number(params.id);
		if (!entry_id) {
			throw error(400, 'id invalido');
		}
		if (!form.valid) {
			return { form };
		}
		const {
			invoice_number,
			issue_date,
			due_date,
			iva_tax_percentage,
			withdrawal_tax_amount,
			batches
		} = form.data;
		const res = await purchases_service.add_invoice_to_entry({
			entry_id,
			invoice: {
				number: invoice_number,
				issue_date,
				due_date
			},
			iva_tax_percentage,
			withdrawal_tax_amount,
			batches
		});

		switch (res.type) {
			case 'LOGIC_ERROR':
				throw error(500, res.message);
			case 'SUCCESS': {
				const base_url = '/bocantino/insumos-ingresados/[id]' satisfies LayoutRouteId;
				const url = base_url.replace('[id]', String(entry_id));
				throw redirect(302, url);
			}
			default:
				should_not_reach(res);
		}
		return { form };
	}
};
