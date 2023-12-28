import { superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';

export const VALID_UNITS = ['Gramos', 'KiloGramos'] as const;

export const ingredient_schema = z.object({
	name: z.string().min(2, 'demasiado corto').max(255, 'demaiado largo'),
	unit: z.enum(VALID_UNITS),
	reorderPoint: z.number().positive('Ingrese un numero valido.'),
	source: z
		.object({
			id: z.number().int().positive(),
			amount: z.number().positive()
		})
		.nullish()
});

export type IngredientSchema = typeof ingredient_schema;

export function createForm(value?: {
	name: string;
	unit: string;
	derivedId: number;
	amount: number;
}) {
	if (value) {
		//@ts-ignore
		return superValidate(value, ingredient_schema);
	} else {
		return superValidate(ingredient_schema);
	}
}

