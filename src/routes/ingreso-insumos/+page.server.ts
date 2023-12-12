import type { PageServerLoad } from './$types';
import type { Actions } from '@sveltejs/kit';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';

const newBagsSchema = z.object({
	supplierId: z.coerce.number().int().min(1, 'Requerido'),
	invoiceNumber: z.string().min(4, 'Requerido').max(255),
	issueDate: z
		.date()
		.min(new Date(2000, 1, 1))
		.max(new Date(2200, 1, 1)),
	bags: z
		.object({
			ingredientId: z.number().int().min(1),
			supplier_batch_code: z.string().min(2).max(256),
			autoGenerateCode: z.boolean(),
			fullAmount: z.number().positive()
		})
		.array()
		.nonempty()
});

export const load: PageServerLoad = async () => {
	const EMPTY_BAG = {
		supplierId: 0,
		ingredientId: 0,
		supplier_batch_code: '',
		autoGenerateCode: false,
		fullAmount: 0
	};
	const form = superValidate(newBagsSchema, { errors: false });
	return { form, EMPTY_BAG };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, newBagsSchema);
		if (!form.valid) {
			console.log(form.errors);
			return { form };
		}
		console.log('POST', form.data);
		return { form };
	}
};
