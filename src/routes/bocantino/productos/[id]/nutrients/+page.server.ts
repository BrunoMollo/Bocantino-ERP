import { parse_id_param, should_not_reach } from '$lib/utils';
import { nutritional_information_service } from '$logic/nutricional-information-service';
import { product_service } from '$logic/product-service';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { arraify_nutritional_info } from '$lib/nutrients-utils';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = parse_id_param(params);
	const product = await product_service.getById(id);
	if (!product) {
		throw error(404, 'producto no existe');
	}
	const recipe = await product_service.getRecipie(id);
	const res = await nutritional_information_service.calculateNutricionalInformation(recipe);
	switch (res.type) {
		case 'LOGIC_ERROR':
			throw error(400, res.message);
		case 'SUCCESS':
			break;
		default:
			should_not_reach(res);
	}

	const nutritional_info = arraify_nutritional_info(res.data);

	return { product, nutritional_info };
};
