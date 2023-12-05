import type { Actions } from "@sveltejs/kit";
import { backendValidate } from "zod-actions";
import { tipoMateriaPrima_schema } from "./tipoMateriaPrima_schema";


export const actions: Actions = {
	default: async ({ request }) => {
		const { failure, data } = await backendValidate(tipoMateriaPrima_schema, request);
		if (failure) return failure;

		console.log(data);


	}
};
