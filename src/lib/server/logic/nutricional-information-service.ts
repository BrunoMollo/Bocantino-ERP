import { inArray } from 'drizzle-orm';
import { db } from '../db';
import { t_ingredient } from '../db/schema';
import { has_repeted } from '$lib/utils';
import { is_ok, logic_error } from '$logic';

type NutritionalInfo = {
	nutrient_fat: number;
	nutrient_carb: number;
	nutrient_protein: number;
};

const empty_nutritional_info = {
	nutrient_fat: 0,
	nutrient_carb: 0,
	nutrient_protein: 0
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
				ingredient.nutrient_protein;
				return {
					nutrient_fat: ingredient.nutrient_fat * amount,
					nutrient_carb: ingredient.nutrient_carb * amount,
					nutrient_protein: ingredient.nutrient_protein * amount
				} satisfies NutritionalInfo;
			})
			.reduce((acum, next) => {
				return {
					nutrient_fat: sum(acum, next, 'nutrient_fat'),
					nutrient_protein: sum(acum, next, 'nutrient_protein'),
					nutrient_carb: sum(acum, next, 'nutrient_carb')
				};
			}, empty_nutritional_info);
		return is_ok(info);
	}
}
export const nutritional_information_service = new NutricionalInformationserivce();

