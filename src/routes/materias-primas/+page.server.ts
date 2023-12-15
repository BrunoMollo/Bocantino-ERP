import type { PageServerLoad } from './$types';
import { getAllIngredients } from '$lib/logic/ingredients';

export const load: PageServerLoad = async () => {
	const list = await getAllIngredients();
	return { list };
};

