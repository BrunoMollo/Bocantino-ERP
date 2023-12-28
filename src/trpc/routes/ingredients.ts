import { ingredients_service } from '$logic';
import { t } from '$trpc/init';
import { z } from 'zod';

export const ingredient = t.router({
	delete: t.procedure.input(z.number().positive().int()).mutation(async ({ input }) => {
		try {
			await ingredients_service.deletebyID(input);
			return 'OK' as const;
		} catch (err) {
			return 'ERROR' as const;
		}
	}),
	recipe: t.procedure.input(z.coerce.number().positive().int()).query(async ({ input }) => {
		try {
			return await ingredients_service.getRecipie(input);
		} catch {
			return 'ERROR' as const;
		}
	})
});

