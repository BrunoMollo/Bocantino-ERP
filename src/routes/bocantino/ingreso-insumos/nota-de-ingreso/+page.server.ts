import { isValidDateBackend, parseStringToDate } from '$lib/utils';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/client';
import { suppliers_service } from '$logic/suppliers-service';
import { purchases_service } from '$logic/ingredient-purchase-service';
import { redirect } from '@sveltejs/kit';

const boughBatchDto_entryNote = z.object({
	supplier_id: z.coerce.number().int().min(1, 'Requerido'),
	batches: z
		.object({
			batch_code: z.string().min(2).max(256),
			initial_amount: z.coerce.number().positive(),
			production_date: z.string().refine(isValidDateBackend).transform(parseStringToDate),
			expiration_date: z.string().refine(isValidDateBackend).transform(parseStringToDate),
			ingredient_id: z.coerce.number().int().min(1),
			cost: z.coerce.number().positive(),
			number_of_bags: z.coerce.number().positive()
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
			return { form };
		}

		const entry_note_number = `EN-${new Date().getTime()}`;
		const { batches, supplier_id } = form.data;
		await purchases_service.registerBoughtIngrediets_EntryNote({
			supplier_id,
			batches,
			document: {
				number: entry_note_number
			}
		});

		throw redirect(
			302,
			`/bocantino/insumos-ingresados?toast=Se registraron los ${batches.length} lotes`
		);
	}
};
