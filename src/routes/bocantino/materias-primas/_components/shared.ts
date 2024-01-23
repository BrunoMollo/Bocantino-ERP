import { superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';

export const VALID_UNITS = ['gr', 'Kg'] as const;

export const ingredient_schema = z.object({
	name: z.string().min(2, 'demasiado corto').max(255, 'demaiado largo'),
	unit: z.enum(VALID_UNITS),
	reorder_point: z.number().positive('Ingrese un numero valido.').min(1),
	source: z
		.object({
			id: z.number().int().positive(),
			amount: z.coerce.number().positive()
		})
		.nullish()
});

export type IngredientSchema = typeof ingredient_schema;

export function createForm(value?: typeof ingredient_schema._type) {
	if (value) {
		console.log(value);
		return superValidate(value, ingredient_schema, { errors: false });
	} else {
		return superValidate(ingredient_schema);
	}
}
