import { ingredients_service } from '$logic/ingredient-service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const ingredients = await ingredients_service.getAllWithStock();
	return { 
		ingredients,
		pending_productions: [], // TODO: Implement pending productions service
		entries: [] // TODO: Implement recent entries service
	};
};

