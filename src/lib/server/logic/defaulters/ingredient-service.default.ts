import { ingredients_service } from '$logic/ingredient-service';
import { some_string } from './utils';

class IngredientServiceDefaulter {
	async add_derived({ from, amount }: { from: number; amount: number }) {
		return await ingredients_service
			.add(
				{
					name: some_string(),
					unit: 'Kg',
					reorder_point: 100,
					nutrient_fat: 1,
					nutrient_carb: 1,
					nutrient_protein: 1,
					nutrient_ashes: 0,
					nutrient_fiber: 0,
					nutrient_calcium: 0,
					nutrient_sodium: 0,
					nutrient_humidity: 0,
					nutrient_phosphorus: 0
				},
				{ id: from, amount }
			)
			.then((x) => x.id);
	}
	async add_simple() {
		return await ingredients_service
			.add({
				name: some_string(),
				unit: 'Kg',
				reorder_point: 100,
				nutrient_fat: 1,
				nutrient_carb: 1,
				nutrient_protein: 1,
				nutrient_ashes: 0,
				nutrient_fiber: 0,
				nutrient_calcium: 0,
				nutrient_sodium: 0,
				nutrient_humidity: 0,
				nutrient_phosphorus: 0
			})
			.then((x) => x.id);
	}

	async add_simple_with_nutrients(data: {
		nutrient_protein: number;
		nutrient_fat: number;
		nutrient_carb: number;
	}) {
		const { nutrient_carb, nutrient_fat, nutrient_protein } = data;
		return await ingredients_service
			.add({
				name: some_string(),
				unit: 'Kg',
				reorder_point: 100,
				nutrient_fat,
				nutrient_carb,
				nutrient_protein,
				nutrient_ashes: 0,
				nutrient_fiber: 0,
				nutrient_calcium: 0,
				nutrient_sodium: 0,
				nutrient_humidity: 0,
				nutrient_phosphorus: 0
			})
			.then((x) => x.id);
	}
}

export const ingredient_defaulter_service = new IngredientServiceDefaulter();

