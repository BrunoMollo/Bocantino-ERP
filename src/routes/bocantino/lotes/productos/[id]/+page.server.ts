import { product_service } from '$logic/product-service';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';

export const load: PageServerLoad = async (url) => {
	//@ts-expect-error PENDING: explain
	const id = url.params.id;
	const productBatch = await product_service.getProductBatchByID(id);
	if (!productBatch) {
		throw error(400, 'id invalido');
	}
	return { productBatch };
};
