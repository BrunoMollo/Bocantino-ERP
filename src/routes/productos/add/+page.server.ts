import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { t_product, tr_ingredient_product } from '$lib/server/db/schema';
import { getFirst } from '$lib/utils';
import { superValidate } from 'sveltekit-superforms/server';
import { product_schema } from '../_shared/zodSchema';
import { ingredients_service } from '$logic';

export const load: PageServerLoad = async () => {
	const form = superValidate(product_schema);
	const ingredients = await ingredients_service.getAll();
	return { ingredients, form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, product_schema);
		if (!form.valid) {
			return { form };
		}

		const { desc, ingredients } = form.data;

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

		throw redirect(302, '/productos?toast=Producto agregado');
	}
};

