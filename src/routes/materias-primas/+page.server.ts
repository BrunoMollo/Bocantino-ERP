import type { PageServerLoad } from './$types';
import * as ingredients_service from '$lib/server/logic/ingredients';


export const load: PageServerLoad = async () => {
	const list = await ingredients_service.getAll();
	return { list };
};


