import type { PageServerLoad } from './$types';
import { ingredients_ctrl } from '$lib/logic/ingredients';

export const load: PageServerLoad = async () => {
	const list = await ingredients_ctrl.getAll();
	return { list };
};

