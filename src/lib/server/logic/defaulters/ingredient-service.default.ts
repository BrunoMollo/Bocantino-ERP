import { ingredients_service } from '$logic/ingredient-service';
import crypto from 'crypto';

function some_string() {
	return crypto.randomBytes(4).toString('hex');
}
class IngredientServiceDefaulter {
	async add_simple() {
		return await ingredients_service
			.add({
				name: some_string(),
				unit: 'Kg',
				reorder_point: 100,
				nutrient_fat: 1,
				nutrient_carb: 1,
				nutrient_protein: 1
			})
			.then((x) => x.id);
	}
}

export const ingredient_defaulter_service = new IngredientServiceDefaulter();

