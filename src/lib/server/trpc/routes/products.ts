import { z } from 'zod';
import { publicProcedure, router } from '../context';
import { product_service } from '$logic/product-logic';

export const products = router({
	recipe: publicProcedure.input(z.coerce.number().positive().int()).query(async ({ input }) => {
		try {
			return await product_service.getRecipie(input);
		} catch {
			return 'ERROR' as const;
		}
	})
});

