import { db } from '$lib/server/db';
import { t_entry_document, t_ingridient_entry, t_supplier } from '$lib/server/db/schema';
import { t } from '$trpc/init';
import { eq, like } from 'drizzle-orm';
import { z } from 'zod';

export const entries = t.router({
	get: t.procedure
		.input(
			z.object({
				supplierName: z.string().nullish(),
				page: z.number().positive().int(),
				pageSize: z.number().positive().int().max(20)
			})
		)
		.query(async ({ input }) => {
			const entries = await db
				.select({
					id: t_ingridient_entry.id,
					supplier: t_supplier.name,
					date: t_ingridient_entry.creation_date,
					number: t_entry_document.number
				})
				.from(t_ingridient_entry)
				.innerJoin(t_supplier, eq(t_ingridient_entry.supplierId, t_supplier.id))
				.innerJoin(t_entry_document, eq(t_entry_document.id, t_ingridient_entry.documentId))
				.where(like(t_supplier.name, `${input.supplierName ?? ''}%`))
				.limit(input.pageSize + (input.page + 1) * input.pageSize)
				.offset((input.page + 1) * input.pageSize); //TODO : fix

			return entries;
		})
});

