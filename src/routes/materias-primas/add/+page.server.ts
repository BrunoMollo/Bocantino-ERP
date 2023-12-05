import { redirect, type Actions } from "@sveltejs/kit";
import { backendValidate } from "zod-actions";
import { tipoMateriaPrima_schema } from "../tipoMateriaPrima_schema";
import { db } from "$lib";
import { tipoMateriaPrima } from "$lib/server/schema";


export const actions: Actions = {
	default: async ({ request }) => {
		const { failure, data } = await backendValidate(tipoMateriaPrima_schema, request);
		if (failure) return failure;

		console.log(data);

		await db.insert(tipoMateriaPrima).values(data)

		throw redirect(302, '/materias-primas?toast=Materia prima agregada con exito')
	}
};
