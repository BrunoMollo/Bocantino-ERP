import type { t_ingredient } from './server/db/schema';
import { should_not_reach } from './utils';

export type Nutrients =
	| (keyof typeof t_ingredient.$inferInsert & `nutrient_${string}`)
	| 'nutrient_calories';
export type NutritionalInfo = Record<Nutrients, number>;

export const arraify_nutritional_info = (nutritional_info: NutritionalInfo) =>
	Object.entries(nutritional_info).map(([identifier, amount]) => ({
		identifier: identifier as Nutrients,
		amount: Math.round(amount * 10_000) / 10_000
	}));

export function nutrient_name(name: Nutrients) {
	switch (name) {
		case 'nutrient_calories':
			return 'Calorias';
		case 'nutrient_protein':
			return 'Proteina';
		case 'nutrient_carb':
			return 'Carbohidratos';
		case 'nutrient_fat':
			return 'Grasas';
		case 'nutrient_ashes':
			return 'Cenizas';
		case 'nutrient_fiber':
			return 'Fibra';
		case 'nutrient_calcium':
			return 'Calcio';
		case 'nutrient_sodium':
			return 'Sodio';
		case 'nutrient_humidity':
			return 'Humedad';
		case 'nutrient_phosphorus':
			return 'Fosoforo';
		default:
			should_not_reach(name);
	}
}

export function unit_nutrient(name: Nutrients) {
	switch (name) {
		case 'nutrient_calories':
			return 'cal';
		case 'nutrient_protein':
		case 'nutrient_carb':
		case 'nutrient_fat':
		case 'nutrient_ashes':
		case 'nutrient_fiber':
		case 'nutrient_calcium':
		case 'nutrient_sodium':
		case 'nutrient_humidity':
		case 'nutrient_phosphorus':
			return 'gr';
		default:
			should_not_reach(name);
	}
}
