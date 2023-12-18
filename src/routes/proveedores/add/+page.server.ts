import { db } from '$lib/server/db';
import { t_supplier, tr_supplier_ingredient } from '$lib/server/db/schema';
import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';
import { getFirst } from '$lib/utils';
import * as ingredients_ctrl from '$lib/server/logic/ingredients';
import { createForm, supplier_schema } from '../_components/shared';
import { superValidate } from 'sveltekit-superforms/server';

export const load: PageServerLoad = async () => {
	const ingredients = await ingredients_ctrl.getAll();
	const form = createForm();
	return { ingredients, form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, supplier_schema);
		if (!form.valid) {
			return { form };
		}

		const { name, email, ingredientsIds } = form.data;

		await db.transaction(async (tx) => {
			const { generatedId } = await tx
				.insert(t_supplier)
				.values({ name, email })
				.returning({ generatedId: t_supplier.id })
				.then(getFirst);

			for (const ingredientId of ingredientsIds) {
				await tx.insert(tr_supplier_ingredient).values({ supplierId: generatedId, ingredientId });
			}
		});

		throw redirect(302, '/proveedores?toast=Proveedor registrado');
	}
};
