import type { Actions } from "@sveltejs/kit";
import { backendValidate } from "zod-actions";
import { product_schema } from "../product_schema";
import type { PageServerLoad } from "./$types";
import { db } from "$lib";
import { t_ingredient, t_product, tr_ingredient_product } from "$lib/server/schema";
import { getFirst } from "$lib/utils";

export const load: PageServerLoad = async ({ }) => {
	const materiasPrimas = await db.select().from(t_ingredient)
	return { materiasPrimas }
}

export const actions: Actions = {
	default: async ({ request, }) => {
		const { failure, data } = await backendValidate(product_schema, request);
		if (failure) return failure;

		const { desc, ingredients } = data

		await db.transaction(async (tx) => {
			const { generatedId } = await tx.insert(t_product).values({ desc })
				.returning({ generatedId: t_product.id })
				.then(getFirst)

			for (let { id, amount } of ingredients) {
				await tx.insert(tr_ingredient_product).values({
					ingredientId: id,
					productId: generatedId,
					amount
				})
			}
		})

		return {}
	}
};
