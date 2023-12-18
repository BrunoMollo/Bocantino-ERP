import { db } from '$lib';
import { t_supplier, tr_supplier_ingredient } from '$lib/server/schema';
import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';
import { supplier_schema } from '../supplier_schema';
import { backendValidate } from 'zod-actions';
import { getFirst } from '$lib/utils';
import * as ingredients_ctrl from '$lib/server/logic/ingredients';

export const load: PageServerLoad = async () => {
	const ingredients = await ingredients_ctrl.getAll();

	return { ingredients };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const { failure, data } = await backendValidate(supplier_schema, request);
		if (failure) return failure;

		const { name, email, ingredients } = data;

		await db.transaction(async (tx) => {
			const { generatedId } = await tx
				.insert(t_supplier)
				.values({ name, email })
				.returning({ generatedId: t_supplier.id })
				.then(getFirst);

			for (const ingredient of ingredients) {
				await tx
					.insert(tr_supplier_ingredient)
					.values({ supplierId: generatedId, ingredientId: ingredient.id });
			}
		});

		throw redirect(302, '/proveedores?toast=Proveedor registrado');
	}
};

