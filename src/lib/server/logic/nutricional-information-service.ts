import { inArray } from 'drizzle-orm';
import { db } from '../db';
import { t_ingredient } from '../db/schema';
import { has_repeted, type NutritionalInfo } from '$lib/utils';
import { is_ok, logic_error } from '$logic';

const empty_nutritional_info = {
	nutrient_calories: 0,
	nutrient_fat: 0,
	nutrient_carb: 0,
	nutrient_protein: 0,
	nutrient_ashes: 0,
	nutrient_fiber: 0,
	nutrient_calcium: 0,
	nutrient_sodium: 0,
	nutrient_humidity: 0,
	nutrient_phosphorus: 0
} as const satisfies NutritionalInfo;

function sum<T>(obj1: T, obj2: T, key: keyof T) {
	return Number(obj1[key]) + Number(obj2[key]);
}
export class NutricionalInformationserivce {
	async calculateNutricionalInformation(recipe: { ingredient_id: number; amount: number }[]) {
		const ingredients_ids = recipe.map((x) => x.ingredient_id);

		if (has_repeted(ingredients_ids)) {
			return logic_error('Se indico un mismo ingrediente  en mas de una linea');
		}
		const used_ingredients = await db
			.select()
			.from(t_ingredient)
			.where(inArray(t_ingredient.id, ingredients_ids));
		const info = used_ingredients
			.map((ingredient) => {
				const amount = recipe.find((x) => x.ingredient_id === ingredient.id)?.amount || 0;

				const nutrient_fat = ingredient.nutrient_fat * amount;
				const nutrient_carb = ingredient.nutrient_carb * amount;
				const nutrient_protein = ingredient.nutrient_protein * amount;
				return {
					nutrient_calories: this.calculate_calories({
						nutrient_carb,
						nutrient_protein,
						nutrient_fat
					}),
					nutrient_carb,
					nutrient_protein,
					nutrient_fat,
					nutrient_ashes: ingredient.nutrient_ashes * amount,
					nutrient_fiber: ingredient.nutrient_fiber * amount,
					nutrient_calcium: ingredient.nutrient_calcium * amount,
					nutrient_sodium: ingredient.nutrient_sodium * amount,
					nutrient_humidity: ingredient.nutrient_humidity * amount,
					nutrient_phosphorus: ingredient.nutrient_phosphorus * amount
				} satisfies NutritionalInfo;
			})
			.reduce((acum, next) => {
				return {
					nutrient_calories: sum(acum, next, 'nutrient_calories'),
					nutrient_fat: sum(acum, next, 'nutrient_fat'),
					nutrient_protein: sum(acum, next, 'nutrient_protein'),
					nutrient_carb: sum(acum, next, 'nutrient_carb'),
					nutrient_ashes: sum(acum, next, 'nutrient_ashes'),
					nutrient_fiber: sum(acum, next, 'nutrient_fiber'),
					nutrient_calcium: sum(acum, next, 'nutrient_calcium'),
					nutrient_sodium: sum(acum, next, 'nutrient_sodium'),
					nutrient_humidity: sum(acum, next, 'nutrient_humidity'),
					nutrient_phosphorus: sum(acum, next, 'nutrient_phosphorus')
				};
			}, empty_nutritional_info);
		return is_ok(info);
	}

	private calculate_calories(macros: {
		nutrient_carb: number;
		nutrient_protein: number;
		nutrient_fat: number;
	}) {
		const { nutrient_carb, nutrient_protein, nutrient_fat } = macros;
		const calories = nutrient_carb * 3.5 + nutrient_protein * 3.5 + nutrient_fat * 8.5;
		return calories;
	}
}
export const nutritional_information_service = new NutricionalInformationserivce();
