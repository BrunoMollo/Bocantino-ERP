import { z } from 'zod';
import { publicProcedure, router } from '../context';
import { purchases_service } from '$logic';

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
			return await purchases_service.getEntries({
				supplierName: input.supplierName ?? '',
				page: input.page,
				pageSize: input.pageSize
			});
		}),
	getBatches: publicProcedure.input(z.number().int().positive()).query(async ({ input }) => {
		return await purchases_service.getBatchesByEntryId(input);
	})
});

