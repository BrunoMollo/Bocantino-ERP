import type { PageServerLoad } from './$types';
import * as ingredients_ctrl from '$lib/server/logic/ingredients';


export const load: PageServerLoad = async () => {
	const list = await ingredients_ctrl.getAll();
	return { list };
};


