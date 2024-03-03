import type { PageServerLoad } from './$types';
import { product_service } from '$logic/product-service';

export const load: PageServerLoad = async () => {
	const pending_productions = await product_service.getBatchesInProduction();
	return { pending_productions };
};
