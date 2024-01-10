import { purchases_service } from '$logic';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const entries = await purchases_service.getEntries({
		supplierName: '',
		page: 0,
		pageSize: 10
	});
	return { entries };
};

