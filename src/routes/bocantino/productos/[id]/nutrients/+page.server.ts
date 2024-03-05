import { nutritional_information_service } from '$logic/nutricional-information-service';
import { product_service } from '$logic/product-service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	product_service.getRecipie(product_id);
	nutritional_information_service.calculateNutricionalInformation(recipe);
	return { form };
};
