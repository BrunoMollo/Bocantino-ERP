import { isValidDateBackend, parseStringToDate } from '$lib/utils';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/client';
import { suppliers_service } from '$logic/suppliers-service';

const boughBatchDto_entryNote = z.object({
	supplier_id: z.coerce.number().int().min(1, 'Requerido'),
	document_number: z.coerce.string().min(2).max(256),
	batches: z
		.object({
			ingredient_id: z.coerce.number().int().min(1),
			initial_amount: z.coerce.number().positive(),
			number_of_bags: z.coerce.number().positive(),
			production_date: z.string().refine(isValidDateBackend).transform(parseStringToDate),
			expiration_date: z.string().refine(isValidDateBackend).transform(parseStringToDate),
			batch_code: z.string().min(2).max(256)
		})
		.array()
		.nonempty()
});

export const load: PageServerLoad = async () => {
	const suppliers = suppliers_service.getAll();
	const form = superValidate(boughBatchDto_entryNote);
	return { form, suppliers };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, boughBatchDto_entryNote);
		if (!form.valid) {
			console.log(form.errors);
			return { form };
		}
		console.log(form.data);

		// throw redirect(
		// 	302,
		// 	`/bocantino/insumos-ingresados?toast=Se registraron los ${batches.length} lotes`
		// );
		return { form };
	}
};
