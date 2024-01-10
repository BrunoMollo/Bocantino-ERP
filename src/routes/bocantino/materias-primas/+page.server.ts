import { ingredients_service } from '$logic';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const list = await ingredients_service.getAll();
	return { list };
};

