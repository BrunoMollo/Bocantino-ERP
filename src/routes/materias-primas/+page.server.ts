import type { PageServerLoad } from './$types';
import * as ingredients_ctrl from '$lib/logic/ingredients';

export const load: PageServerLoad = async () => {
	const list = await ingredients_ctrl.getAll();
	return { list };
};

