import type { PageServerLoad } from './$types';
import { ingredient_production_service } from '$logic/ingredient-production-service';

export const load: PageServerLoad = async () => {
	const pending_productions = await ingredient_production_service.getBatchesInProduction();
	return { pending_productions };
};
