import { db } from '$lib/server/db';
import {
	t_entry_document,
	t_ingredient,
	t_ingredient_batch,
	t_ingridient_entry,
	t_supplier
} from '$lib/server/db/schema';
import { on } from 'events';
import type { PageServerLoad } from './$types';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const entries = await db
		.select({
			id: t_ingridient_entry.id,
			supplier: t_supplier.name,
			date: t_ingridient_entry.creation_date,
			number: t_entry_document.number
		})
		.from(t_ingridient_entry)
		.innerJoin(t_supplier, eq(t_ingridient_entry.supplierId, t_supplier.id))
		.innerJoin(t_entry_document, eq(t_entry_document.id, t_ingridient_entry.documentId));
	return { entries };
};


