import { ingredients_service } from '$logic/ingredient-service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const ingredients = ingredients_service.getAllWithStock();
	return { ingredients };
};

