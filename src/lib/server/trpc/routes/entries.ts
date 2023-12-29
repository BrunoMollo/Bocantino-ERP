import { db } from '$lib/server/db';
import { t_entry_document, t_ingridient_entry, t_supplier } from '$lib/server/db/schema';
import { eq, like } from 'drizzle-orm';
import { z } from 'zod';
import { publicProcedure, router } from '../context';

export const entries = router({
	get: publicProcedure
		.input(
			z.object({
				supplierName: z.string().nullish(),
				page: z.number().int(),
				pageSize: z.number().int().max(20)
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
				.limit(input.pageSize)
				.offset(input.page * input.pageSize);
			return entries;
		})
});

