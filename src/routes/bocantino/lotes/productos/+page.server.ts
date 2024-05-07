import { product_service } from '$logic/product-service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const page = Number(url.searchParams.get('page')) || 0; // cant use ??  because of NaN
	const batch_code = url.searchParams.get('batch_code') ?? '';
	const ingredient_name = url.searchParams.get('ingredient_name') ?? '';
	const product_batches = await product_service.getBatchesAvailable({
		page,
		batch_code,
		ingredient_name
	});
	const count_batches = await product_service.getCountOfAvailableBatches();
	const page_size = product_service.PAGE_SIZE;
	return { product_batches, count_batches, page_size };
};
