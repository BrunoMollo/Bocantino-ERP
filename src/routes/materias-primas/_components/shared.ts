import { superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';

export const VALID_UNITS = ['Gramos', 'KiloGramos'] as const;

export const ingredient_schema = z.object({
	name: z.string().min(2, 'demasiado corto').max(255, 'demaiado largo'),
	unit: z.enum(VALID_UNITS)
});

export type IngredientSchema = typeof ingredient_schema;

export function createForm(value?: { name: string; unit: string }) {
	if (value) {
		//@ts-ignore
		return superValidate(value, ingredient_schema);
	} else {
		return superValidate(ingredient_schema);
	}
}

