import { suppliers_service } from '$logic';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const suppliers = suppliers_service.getAll();
	return { suppliers };
};
