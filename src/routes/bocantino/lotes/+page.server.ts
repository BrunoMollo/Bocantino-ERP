import { ingredient_production_service } from '$logic';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async ({ request }) => {
	const batches = ingredient_production_service.getBatchesAvailable();
	return { batches };
};

