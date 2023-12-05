import type { Actions } from "@sveltejs/kit";
import { backendValidate } from "zod-actions";
import { producto_schema } from "../producto_schema";
import type { PageServerLoad } from "./$types";
import { db } from "$lib";
import { tipoMateriaPrima } from "$lib/server/schema";

export const load: PageServerLoad = async ({ }) => {
	const materiasPrimas = await db.select().from(tipoMateriaPrima)
	return { materiasPrimas }
}

export const actions: Actions = {
	default: async ({ request, }) => {
		const { failure, data } = await backendValidate(producto_schema, request);
		if (failure) return failure;

		console.log(data);

		return {}
	}
};
