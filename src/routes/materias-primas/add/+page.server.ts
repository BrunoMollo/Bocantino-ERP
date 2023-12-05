import { redirect, type Actions } from "@sveltejs/kit";
import { backendValidate } from "zod-actions";
import { db } from "$lib";
import { t_ingredient } from "$lib/server/schema";
import { ingredient_schema } from "../ingredient_schema";


export const actions: Actions = {
	default: async ({ request }) => {
		const { failure, data } = await backendValidate(ingredient_schema, request);
		if (failure) return failure;

		console.log(data);

		await db.insert(t_ingredient).values(data)

		throw redirect(302, '/materias-primas?toast=Materia prima agregada con exito')
	}
};
