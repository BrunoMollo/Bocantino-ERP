import type { PageServerLoad } from './$types';
import * as suppliers_ctrl from '$lib/server/logic/suppliers';

export const load: PageServerLoad = async () => {
	const suppliers = suppliers_ctrl.getAll();
	return { suppliers };
};

