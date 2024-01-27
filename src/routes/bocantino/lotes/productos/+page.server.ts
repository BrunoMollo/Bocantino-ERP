import { product_service } from '$logic/product-service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const page = Number(url.searchParams.get('page')) || 0; // cant use ??  because of NaN
	const product_batches = await product_service.getBatchesAvailable({ page });
	return { product_batches };
};

