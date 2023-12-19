import type { PageServerLoad } from './$types';
import type { Actions } from '@sveltejs/kit';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import * as ingredients_ctrl from '$lib/server/logic/ingredients';
import { db } from '$lib/server/db';
import { t_document_type } from '$lib/server/db/schema';
import * as suppliers_ctrl from '$lib/server/logic/suppliers';

const newBagsSchema = z.object({
	supplierId: z.coerce.number().int().min(1, 'Requerido'),
	idDocumentType: z.coerce.number().int().min(1, ''),
	invoiceNumber: z.string().min(4, 'Requerido').max(255),
	issueDate: z
		.date()
		.min(new Date(2000, 1, 1))
		.max(new Date(2200, 1, 1)),
	batches: z
		.object({
			batch_code: z.string().min(2).max(256),
			initialAmount: z.coerce.number().positive(),
			productionDate: z.string(), //TODO: define what to do
			expirationDate: z.string(), //TODO: idem
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
	console.log({ suppliers });
	const form = superValidate(newBagsSchema, { errors: false });
	return { form, documentTypes, suppliers };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, newBagsSchema);
		if (!form.valid) {
			return { form };
		}

		const batches = form.data.batches.map((x) => {
			return {
				...x,
				expirationDate: new Date(), //TODO: Change this is dumy data
				productionDate: new Date()
			};
		});
		ingredients_ctrl.registerBoughtIngrediets({
			supplierId: form.data.supplierId,
			document: {
				issue_date: form.data.issueDate,
				number: form.data.invoiceNumber,
				typeId: form.data.idDocumentType
			},
			batches
		});

		return { form };
	}
};

