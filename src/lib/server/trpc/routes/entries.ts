import { z } from 'zod';
import { publicProcedure, router } from '../context';
import { purchases_service } from '$logic/ingredient-purchase-service';

export const entries = router({
	getBatches: publicProcedure.input(z.number().int().positive()).query(async ({ input }) => {
		return await purchases_service.getBatchesByEntryId(input);
	})
});
