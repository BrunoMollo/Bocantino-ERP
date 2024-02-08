import { purchases_service } from '$logic/ingredient-purchase-service';
import { ingredients_service } from '$logic/ingredient-service';
import { product_service } from '$logic/product-service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const ingredients = ingredients_service.getAllWithStock();
	const pending_productions = await product_service.getLastBatchesInProduction();
	const entries = purchases_service.getLastEntries();
	return { ingredients, entries, pending_productions };
};

