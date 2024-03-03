import { product_service } from '$logic/product-service';
import { some_string } from './utils';

class ProductServiceDefaulter {
	async add(ingredients: { ingredient_id: number; amount: number }[]) {
		return await product_service
			.add({
				desc: some_string(),
				ingredients
			})
			.then((x) => x.id);
	}
}

export const product_service_defaulter = new ProductServiceDefaulter();
