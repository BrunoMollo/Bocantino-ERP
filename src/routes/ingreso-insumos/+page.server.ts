import type { PageServerLoad } from './$types';
import type { Actions } from '@sveltejs/kit';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';

// TODO: fix sending date
const newBagsSchema = z.object({
	supplierId: z.number().positive().int(),
	invoiceNumber: z.string().min(4).max(255),
	issueDate: z.date(),
	bags: z
		.object({
			ingredientId: z.number().positive().int(),
			supplier_batch_code: z.string().min(2).max(256),
			autoGenerateCode: z.boolean(),
			fullAmount: z.number().positive()
		})
		.array()
		.nonempty()
});

export const load: PageServerLoad = async ({}) => {
	const EMPTY_BAG = {
		supplierId: 0,
		ingredientId: 0,
		supplier_batch_code: '',
		autoGenerateCode: false,
		fullAmount: 0
	};
	const form = superValidate({ bags: [EMPTY_BAG] }, newBagsSchema);
	return { form, EMPTY_BAG };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, newBagsSchema);
		console.log('POST', form);
	}
};
