import { ingredient_production_service } from '$logic';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async ({ url }) => {
	const page = Number(url.searchParams.get('page')) || 0; // cant use ??  because of NaN
	const batches = await ingredient_production_service.getBatchesAvailable({ page });
	const count_batches = await ingredient_production_service.getCountOfAvailableBatches();
	const page_size = ingredient_production_service.PAGE_SIZE;

	return { batches, count_batches, page_size };
};

