import { ingredients_service } from '$logic/ingredient-service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const list = await ingredients_service.getAll();
	return { list };
};
