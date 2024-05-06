import { describe, expect, vi, test, beforeAll } from 'vitest';
import { product_service } from '$logic/product-service';
import { __DELETE_ALL_DATABASE } from '../utils';
import { ingredient_defaulter_service } from '$logic/defaulters/ingredient-service.default';
import { suppliers_defaulter_service } from '$logic/defaulters/supplier-service.default';
import { purchases_defaulter_service } from '$logic/defaulters/purchase-service.default';

vi.mock('$lib/server/db/index.ts');

let LIVER_ID = -1;
let SUPPLIER_ID = -1;
let LIVER_PRODUCT_ID = -1;

let LIVER_BATCH_ID = -1;

beforeAll(async () => {
	await __DELETE_ALL_DATABASE();
	LIVER_ID = await ingredient_defaulter_service.add_simple();
	SUPPLIER_ID = await suppliers_defaulter_service.add({ ingredientsIds: [LIVER_ID] });

	LIVER_PRODUCT_ID = await product_service
		.add({
			desc: 'Alimento para perros',
			ingredients: [{ ingredient_id: LIVER_ID, amount: 1 }]
		})
		.then((x) => x.id);

	[LIVER_BATCH_ID] = await purchases_defaulter_service.buy({
		supplier_id: SUPPLIER_ID,
		bought: [{ ingredient_id: LIVER_ID, initial_amount: 2_000_000 }]
	});
});

describe('get available product batches', () => {
	test('query 10 batches', async () => {
		const total_batches = 10;
		for (let i = 0; i < total_batches; i++) {
			const batch_id = await product_service
				.startProduction({
					product_id: LIVER_PRODUCT_ID,
					recipe: [{ amount: 1, ingredient_id: LIVER_ID }],
					produced_amount: 1,
					batches_ids: [[LIVER_BATCH_ID]]
				})
				.then((x) => (x.type == 'SUCCESS' ? x.data.id : -1));

			await product_service.closeProduction({ batch_id, adjustment: 0 });
		}
		const aaaa = await product_service.getBatchesAvailable({
			page: 0,
			batch_code: '',
			ingredient_name: ''
		});
		expect(aaaa.length).toBe(total_batches);
	});
});
