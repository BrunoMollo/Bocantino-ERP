import { z } from 'zod';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/client';
import { isValidDateBackend, parseStringToDate } from '$lib/utils';
import { db } from '$lib/server/db';
import { t_document_type } from '$lib/server/db/schema';

const edit_entry_schema = z.object({
	idDocumentType: z.coerce.number().int().min(1, ''),
	invoiceNumber: z.string().min(4, 'Requerido').max(255),
	issueDate: z.string().refine(isValidDateBackend).transform(parseStringToDate),
	due_date: z.string().refine(isValidDateBackend).transform(parseStringToDate)
});

export const load: PageServerLoad = async () => {
	const form = superValidate(edit_entry_schema);
	const document_types = await db.select().from(t_document_type);
	return { form, document_types };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, edit_entry_schema);
		if (!form.valid) {
			return { form };
		}
		console.log(form.data);
		return { form };
	}
};
