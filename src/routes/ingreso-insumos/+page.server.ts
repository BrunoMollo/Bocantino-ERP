import type { PageServerLoad } from './$types';
import { redirect, type Actions } from '@sveltejs/kit';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import * as ingredients_ctrl from '$lib/server/logic/ingredients';
import { db } from '$lib/server/db';
import { t_document_type } from '$lib/server/db/schema';
import * as suppliers_ctrl from '$lib/server/logic/suppliers';
import { isValidDateBackend, parseStringToDate } from '$lib/utils';

const boughBatchSchema = z.object({
	supplierId: z.coerce.number().int().min(1, 'Requerido'),
	idDocumentType: z.coerce.number().int().min(1, ''),
	invoiceNumber: z.string().min(4, 'Requerido').max(255),
	issueDate: z.string().refine(isValidDateBackend).transform(parseStringToDate),
	batches: z
		.object({
			batch_code: z.string().min(2).max(256),
			initialAmount: z.coerce.number().positive(),
			productionDate: z.string().refine(isValidDateBackend).transform(parseStringToDate),
			expirationDate: z.string().refine(isValidDateBackend).transform(parseStringToDate),
			ingredientId: z.coerce.number().int().min(1),
			cost: z.coerce.number().positive(),
			numberOfBags: z.coerce.number().positive()
		})
		.array()
		.nonempty()
});

export const load: PageServerLoad = async () => {
	const documentTypes = await db.select().from(t_document_type);
	const suppliers = await suppliers_ctrl.getAll();
	const form = superValidate(boughBatchSchema, { errors: false });
	return { form, documentTypes, suppliers };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, boughBatchSchema);
		if (!form.valid) {
			return { form };
		}

		const { batches, supplierId } = form.data;
		await ingredients_ctrl.registerBoughtIngrediets({
			supplierId,
			batches,
			document: {
				issue_date: form.data.issueDate,
				number: form.data.invoiceNumber,
				typeId: form.data.idDocumentType
			}
		});

		throw redirect(302, `/insumos-ingresados?toast=Se registraron los ${batches.length} lotes`);
	}
};

