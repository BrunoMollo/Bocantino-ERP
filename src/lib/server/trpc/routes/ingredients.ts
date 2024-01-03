import { ingredients_service, ingredient_production_service } from '$logic';
import { z } from 'zod';
import { publicProcedure, router } from '../context';

export const ingredient = router({
	delete: publicProcedure.input(z.number().positive().int()).mutation(async ({ input }) => {
		try {
			await ingredients_service.deletebyID(input);
			return 'OK' as const;
		} catch (err) {
			return 'ERROR' as const;
		}
	}),
	recipe: publicProcedure.input(z.coerce.number().positive().int()).query(async ({ input }) => {
		try {
			return await ingredients_service.getRecipie(input);
		} catch {
			return 'ERROR' as const;
		}
	}),
	batches: publicProcedure.input(z.coerce.number().positive().int()).query(async ({ input }) => {
		return await ingredient_production_service.getBatchesByIngredientId(input);
	})
});

