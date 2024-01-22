import { suppliers_service } from '$logic/suppliers-service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const suppliers = suppliers_service.getAll();
	return { suppliers };
};

