import { z } from 'zod';
import { publicProcedure, router } from '../context';
import { ingredients_service } from '$logic';
import { db } from '$lib/server/db';
import { t_ingredient, t_ingredient_batch, t_ingridient_entry } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const entries = router({
	get: publicProcedure
		.input(
			z.object({
				supplierName: z.string().nullable(),
				page: z.number().int(),
				pageSize: z.number().int().max(20)
			})
		)
		.query(async ({ input }) => {
			return await ingredients_service.getEntries({
				supplierName: input.supplierName ?? '',
				page: input.page,
				pageSize: input.pageSize
			});
		}),
	getBatches: publicProcedure.input(z.number().int().positive()).query(async ({ input }) => {
		return await ingredients_service.getBatchesByEntryId(input);
	})
});

