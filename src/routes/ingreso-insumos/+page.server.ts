import type { PageServerLoad } from './$types';
import type { Actions } from '@sveltejs/kit';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';

const newBagsSchema = z.object({
	supplierId: z.coerce.number().int().min(1, 'Requerido'),
	idDocumentType: z.coerce.number().int().min(1, ''),
	invoiceNumber: z.string().min(4, 'Requerido').max(255),
	issueDate: z
		.date()
		.min(new Date(2000, 1, 1))
		.max(new Date(2200, 1, 1)),
	batch: z
		.object({
			ingredientId: z.coerce.number().int().min(1),
			cost: z.coerce.number().positive(),
			numberOfBags: z.coerce.number().positive(),
			productionDate: z.string(), //Todo
			expirationDate: z.string(), //Todo
			supplier_batch_code: z.string().min(2).max(256),
			fullAmount: z.coerce.number().positive()
		})
		.array()
		.nonempty()
});

export const load: PageServerLoad = async () => {
	const form = superValidate(newBagsSchema, { errors: false });
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, newBagsSchema);
		if (!form.valid) {
			console.log(form.errors.batch);
			return { form };
		}
		console.log('POST', form.data);
		return { form };
	}
};
