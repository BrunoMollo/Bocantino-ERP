import { db } from "$lib"
import { tipoMateriaPrima } from "$lib/server/schema"
import { eq } from "drizzle-orm"
import type { PageServerLoad, RouteParams, Actions } from "./$types"
import { error, redirect } from "@sveltejs/kit"
import { backendValidate } from "zod-actions"
import { tipoMateriaPrima_schema } from "../../tipoMateriaPrima_schema"


export const load: PageServerLoad = async ({ params }) => {
	const { id } = parseParams(params)
	const list = await db.select()
		.from(tipoMateriaPrima)
		.where(eq(tipoMateriaPrima.id, id))

	if (list.length === 0) {
		throw error(400, { message: 'invalid id' })
	}

	return { tipoMateriaPrima: list[0] }
}


export const actions: Actions = {
	default: async ({ request, params }) => {
		const { failure, data } = await backendValidate(tipoMateriaPrima_schema, request);
		if (failure) return failure;

		const { id } = parseParams(params)

		await db.update(tipoMateriaPrima).set(data).where(eq(tipoMateriaPrima.id, id))

		throw redirect(302, '/materias-primas?toast=Editado con exito')

	}
};



function parseParams(params: RouteParams) {
	const id = Number(params.id)
	if (isNaN(id)) {
		throw error(400, { message: 'invalid id' })
	}
	return { id }
}
