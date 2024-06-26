import { describe, expect, vi, test, beforeEach, beforeAll } from 'vitest';
import { db } from '$lib/server/db/__mocks__';
import { t_product_batch, tr_product_batch_ingredient_batch } from '$lib/server/db/schema';
import { product_service } from '$logic/product-service';
import { __DELETE_ALL_DATABASE } from '../utils';
import { eq, ne } from 'drizzle-orm';
import { getFirst } from '$lib/utils';
import { ingredient_defaulter_service } from '$logic/defaulters/ingredient-service.default';
import { suppliers_defaulter_service } from '$logic/defaulters/supplier-service.default';
import { purchases_defaulter_service } from '$logic/defaulters/purchase-service.default';

vi.mock('$lib/server/db/index.ts');

let LIVER_ID = -1;
let BANANA_ID = -1;
let SUPPLIER_ID = -1;
let LIVER_PRODUCT_ID = -1;

let LIVER_BATCH_ID = -1;
let LIVER_PRODUCT_BATCH_ID = -1;

beforeAll(async () => {
	await __DELETE_ALL_DATABASE();
	LIVER_ID = await ingredient_defaulter_service.add_simple();
	BANANA_ID = await ingredient_defaulter_service.add_simple();

	SUPPLIER_ID = await suppliers_defaulter_service.add({ ingredientsIds: [LIVER_ID, BANANA_ID] });

	LIVER_PRODUCT_ID = await product_service
		.add({
			desc: 'Alimento para perros',
			ingredients: [{ ingredient_id: LIVER_ID, amount: 10 }]
		})
		.then((x) => x.id);

	[LIVER_BATCH_ID] = await purchases_defaulter_service.buy({
		supplier_id: SUPPLIER_ID,
		bought: [
			{ ingredient_id: LIVER_ID, initial_amount: 20_000 },
			{ ingredient_id: BANANA_ID, initial_amount: 10_000 }
		]
	});
});

beforeEach(async () => {
	await db.delete(tr_product_batch_ingredient_batch);
	await db.delete(t_product_batch);
	LIVER_PRODUCT_BATCH_ID = await product_service
		.startProduction({
			product_id: LIVER_PRODUCT_ID,
			recipe: [{ amount: 2, ingredient_id: LIVER_ID }],
			produced_amount: 10,
			batches_ids: [[LIVER_BATCH_ID]]
		})
		.then((x) => (x.type == 'SUCCESS' ? x.data.id : -1));

	await product_service.startProduction({
		product_id: LIVER_PRODUCT_ID,
		recipe: [{ amount: 3, ingredient_id: LIVER_ID }],
		produced_amount: 1,
		batches_ids: [[LIVER_BATCH_ID]]
	});
});

describe('close production of product', () => {
	test('error when batch does not exist', async () => {
		const non_existing_id = LIVER_PRODUCT_BATCH_ID * 100;
		const res = await product_service.closeProduction({
			batch_id: non_existing_id,
			adjustment: 0
		});
		expect(res.type).toBe('LOGIC_ERROR');
	});

	test('updates table', async () => {
		const date = new Date(2000, 1, 1);
		vi.setSystemTime(date);
		const res = await product_service.closeProduction({
			batch_id: LIVER_PRODUCT_BATCH_ID,
			adjustment: 2
		});
		expect(res.type).toBe('SUCCESS');
		const batch = await db
			.select()
			.from(t_product_batch)
			.where(eq(t_product_batch.id, LIVER_PRODUCT_BATCH_ID))
			.then(getFirst);

		expect(batch.adjustment).toBe(2);
		expect(batch.state).toBe('AVAILABLE');
		expect(batch.production_date?.toISOString().split('T')[0]).toBe(
			date.toISOString().split('T')[0]
		);
	});

	test('dont updates other batch', async () => {
		const res = await product_service.closeProduction({
			batch_id: LIVER_PRODUCT_BATCH_ID,
			adjustment: 2
		});
		expect(res.type).toBe('SUCCESS');
		const batches = await db
			.select()
			.from(t_product_batch)
			.where(ne(t_product_batch.id, LIVER_PRODUCT_BATCH_ID));

		for (const b of batches) {
			expect(b.adjustment).toBe(null);
			expect(b.state).toBe('IN_PRODUCTION');
			expect(b.production_date).toBe(null);
		}
	});

	test('error when tries to close a bathc that is already closed', async () => {
		const ALREADY_PRODUCED_BATCH_ID = await product_service
			.startProduction({
				product_id: LIVER_PRODUCT_ID,
				recipe: [{ amount: 2, ingredient_id: LIVER_ID }],
				produced_amount: 10,
				batches_ids: [[LIVER_BATCH_ID]]
			})
			.then((x) => (x.type == 'SUCCESS' ? x.data.id : -1));
		const res1 = await product_service.closeProduction({
			batch_id: ALREADY_PRODUCED_BATCH_ID,
			adjustment: 0
		});
		expect(res1.type).toBe('SUCCESS');

		const res2 = await product_service.closeProduction({
			batch_id: ALREADY_PRODUCED_BATCH_ID,
			adjustment: 1
		});
		expect(res2.type).toBe('LOGIC_ERROR');
	});
});
