import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/client';
import { isValidDateBackend, parseStringToDate } from '$lib/utils';
import { error } from '@sveltejs/kit';
import { purchases_service } from '$logic/ingredient-purchase-service';

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
	default: async ({ request }) => {
		const form = await superValidate(request, add_invoice_dto);
		if (!form.valid) {
			return { form };
		}
		console.log(form.data);
		return { form };
	}
};
