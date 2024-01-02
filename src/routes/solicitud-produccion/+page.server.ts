import { db } from '$lib/server/db';
import { t_ingredient, tr_ingredient_ingredient } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import type { Actions } from '@sveltejs/kit';
import { ingredients_service } from '$logic';

const ingredinetProduction_schema = z.object({
	ingredeintId: z.coerce.number().int().positive(),
	producedAmount: z.coerce.number().positive(),
	selected_batch_id: z.coerce.number().positive().int(),
	second_selected_batch_id: z.coerce.number().positive().int().nullable()
});

export const load: PageServerLoad = async () => {
	const form = superValidate(ingredinetProduction_schema);
	const ingredients = await db
		.select({
			id: t_ingredient.id,
			name: t_ingredient.name,
			unit: t_ingredient.unit,
			derivedId: tr_ingredient_ingredient.derivedId,
			amount: tr_ingredient_ingredient.amount
		})
		.from(tr_ingredient_ingredient)
		.innerJoin(t_ingredient, eq(t_ingredient.id, tr_ingredient_ingredient.derivedId));
	return { form, ingredients };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, ingredinetProduction_schema);
		if (!form.valid) {
			console.log(form.errors);
			return { form };
		}
		// const batches_ids = [form.data.selected_batch_id];
		// ingredients_service.startIngredientProduction({
		// 	ingedient_id: form.data.ingredeintId,
		// 	produced_amount: form.data.producedAmount
		//     2
		// });
	}
};

