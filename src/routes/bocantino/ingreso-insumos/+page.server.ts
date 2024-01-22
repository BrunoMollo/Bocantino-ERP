import type { PageServerLoad } from './$types';
import { redirect, type Actions } from '@sveltejs/kit';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import { db } from '$lib/server/db';
import { t_document_type } from '$lib/server/db/schema';
import { isValidDateBackend, parseStringToDate } from '$lib/utils';
import { purchases_service } from '$logic/ingredient-purchase-service';
import { suppliers_service } from '$logic/suppliers-service';

const boughBatchSchema = z.object({
	supplierId: z.coerce.number().int().min(1, 'Requerido'),
	idDocumentType: z.coerce.number().int().min(1, ''),
	invoiceNumber: z.string().min(4, 'Requerido').max(255),
	issueDate: z.string().refine(isValidDateBackend).transform(parseStringToDate),
	due_date: z.string().refine(isValidDateBackend).transform(parseStringToDate),
	batches: z
		.object({
			batch_code: z.string().min(2).max(256),
			initialAmount: z.coerce.number().positive(),
			productionDate: z.string().refine(isValidDateBackend).transform(parseStringToDate),
			expiration_date: z.string().refine(isValidDateBackend).transform(parseStringToDate),
			ingredientId: z.coerce.number().int().min(1),
			cost: z.coerce.number().positive(),
			numberOfBags: z.coerce.number().positive()
		})
		.array()
		.nonempty()
});

export const load: PageServerLoad = async () => {
	const documentTypes = await db.select().from(t_document_type);
	const suppliers = await suppliers_service.getAll();
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
		await purchases_service.registerBoughtIngrediets({
			perceptions_tax: 10, //TODO: Change
			iva_tax: 21, //TODO: Change
			supplierId,
			batches,
			document: {
				number: form.data.invoiceNumber,
				typeId: form.data.idDocumentType,
				issue_date: form.data.issueDate,
				due_date: form.data.due_date
			}
		});

		throw redirect(
			302,
			`/bocantino/insumos-ingresados?toast=Se registraron los ${batches.length} lotes`
		);
	}
};

