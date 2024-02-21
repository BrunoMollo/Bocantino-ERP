import { superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';

export const VALID_UNITS = ['gr', 'Kg'] as const;

export const ingredient_schema = z.object({
	name: z.string().min(2, 'demasiado corto').max(255, 'demaiado largo'),
	unit: z.enum(VALID_UNITS),
	reorder_point: z.number().positive('Ingrese un numero valido.').min(1),
	nutrient_protein: z.number().positive(),
	nutrient_carb: z.number().positive(),
	nutrient_fat: z.number().positive(),
	nutrient_ashes: z.number().positive(),
	nutrient_fiber: z.number().positive(),
	nutrient_calcium: z.number().positive(),
	nutrient_sodium: z.number().positive(),
	nutrient_humidity: z.number().positive(),
	nutrient_phosphorus: z.number().positive(),
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
		return superValidate(value, ingredient_schema, { errors: false });
	} else {
		return superValidate(ingredient_schema);
	}
}

