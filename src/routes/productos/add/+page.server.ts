import type { Actions } from "@sveltejs/kit";
import { backendValidate } from "zod-actions";
import { product_schema } from "../product_schema";
import type { PageServerLoad } from "./$types";
import { db } from "$lib";
import { t_ingredient } from "$lib/server/schema";

export const load: PageServerLoad = async ({ }) => {
	const materiasPrimas = await db.select().from(t_ingredient)
	return { materiasPrimas }
}

export const actions: Actions = {
	default: async ({ request, }) => {
		const { failure, data } = await backendValidate(product_schema, request);
		if (failure) return failure;

		console.log(data);

		return {}
	}
};
