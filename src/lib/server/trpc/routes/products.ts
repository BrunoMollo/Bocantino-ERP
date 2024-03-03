import { z } from 'zod';
import { publicProcedure, router } from '../context';
import { product_service } from '$logic/product-service';
import { nutritional_information_service } from '$logic/nutricional-information-service';
import { logic_error } from '$logic';

const zod_id = z.coerce.number().positive().int();

export const products = router({
	recipe: publicProcedure.input(zod_id).query(async ({ input }) => {
		try {
			return await product_service.getRecipie(input);
		} catch {
			return 'ERROR' as const;
		}
	}),
	nutritional_info: publicProcedure.input(zod_id).query(async ({ input }) => {
		const exist = await product_service.getById(input);
		if (!exist) {
			return logic_error('Producto NO existe');
		}
		const recipe = await product_service.getRecipie(input);
		return nutritional_information_service.calculateNutricionalInformation(recipe);
	}),
	nutritional_info_modified: publicProcedure
		.input(z.array(z.object({ ingredient_id: zod_id, amount: z.coerce.number().positive() })))
		.query(async ({ input }) => {
			return nutritional_information_service.calculateNutricionalInformation(input);
		})
});
