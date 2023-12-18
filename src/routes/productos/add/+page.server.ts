import type { Actions } from '@sveltejs/kit';
import { backendValidate } from 'zod-actions';
import { product_schema } from '../product_schema';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { t_product, tr_ingredient_product } from '$lib/server/db/schema';
import { getFirst } from '$lib/utils';
import * as ingredients_ctrl from '$lib/server/logic/ingredients';

export const load: PageServerLoad = async () => {
	const ingredients = await ingredients_ctrl.getAll();
	return { ingredients };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const { failure, data } = await backendValidate(product_schema, request);
		if (failure) return failure;

		const { desc, ingredients } = data;

		await db.transaction(async (tx) => {
			const { generatedId } = await tx
				.insert(t_product)
				.values({ desc })
				.returning({ generatedId: t_product.id })
				.then(getFirst);

			for (const { id, amount } of ingredients) {
				await tx.insert(tr_ingredient_product).values({
					ingredientId: id,
					productId: generatedId,
					amount
				});
			}
		});

		return {};
	}
};
