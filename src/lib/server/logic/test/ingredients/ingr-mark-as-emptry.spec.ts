import { describe, vi, test, expect, beforeEach, beforeAll } from 'vitest';
import { db } from '$lib/server/db/__mocks__';
import {
	t_entry_document,
	t_ingredient_batch,
	t_ingridient_entry,
	t_product_batch,
	tr_ingredient_batch_ingredient_batch,
	tr_product_batch_ingredient_batch
} from '$lib/server/db/schema';
import { __DELETE_ALL_DATABASE } from '../utils';
import { getFirst } from '$lib/utils';
import { ingredient_defaulter_service } from '$logic/defaulters/ingredient-service.default';
import { suppliers_defaulter_service } from '$logic/defaulters/supplier-service.default';
import { purchases_defaulter_service } from '$logic/defaulters/purchase-service.default';
import { product_service } from '$logic/product-service';
import { product_service_defaulter } from '$logic/defaulters/product-service.default';
import { ingredient_production_service } from '$logic/ingredient-production-service';

vi.mock('$lib/server/db/index.ts');

let LIVER_ID = -1;
let SUPPLIER_ID = -1;
let PRODUCT_ID = -1;

beforeAll(async () => {
	await __DELETE_ALL_DATABASE();
	LIVER_ID = await ingredient_defaulter_service.add_simple();
	SUPPLIER_ID = await suppliers_defaulter_service.add({ ingredientsIds: [LIVER_ID] });
	PRODUCT_ID = await product_service_defaulter.add([{ ingredient_id: LIVER_ID, amount: 10 }]);
});
beforeEach(async () => {
	await db.delete(tr_product_batch_ingredient_batch);
	await db.delete(t_product_batch);
	await db.delete(tr_ingredient_batch_ingredient_batch);
	await db.delete(t_ingredient_batch);
	await db.delete(t_entry_document);
	await db.delete(t_ingridient_entry);
});

describe.sequential('check if ingredient batch is empty and mark', () => {
	test('change state to EMPYT when production ends', async () => {
		const batch_id = await purchases_defaulter_service
			.buy({
				supplier_id: SUPPLIER_ID,
				bought: [{ ingredient_id: LIVER_ID, initial_amount: 100 }]
			})
			.then(getFirst);

		const res1 = await product_service.startProduction({
			product_id: PRODUCT_ID,
			recipe: [{ ingredient_id: LIVER_ID, amount: 10 }],
			produced_amount: 10,
			batches_ids: [[batch_id]]
		});
		expect(res1.type).toBe('SUCCESS');
		if (res1.type != 'SUCCESS') return;

		const still_batch = await ingredient_production_service.getBatchById(batch_id);
		expect(still_batch?.state).toBe('AVAILABLE');

		const res2 = await product_service.closeProduction({ batch_id: res1.data.id, adjustment: 0 });

		expect(res2.type).toBe('SUCCESS');
		if (res2.type != 'SUCCESS') return;

		const mod_batch = await ingredient_production_service.getBatchById(batch_id);
		expect(mod_batch?.state).toBe('EMPTY');
	});

	test('change state to EMPYT when production ends (2 productions)', async () => {
		const batch_id = await purchases_defaulter_service
			.buy({
				supplier_id: SUPPLIER_ID,
				bought: [{ ingredient_id: LIVER_ID, initial_amount: 100 }]
			})
			.then(getFirst);

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		for (const _ of [1, 2]) {
			const res1 = await product_service.startProduction({
				product_id: PRODUCT_ID,
				recipe: [{ ingredient_id: LIVER_ID, amount: 10 }],
				produced_amount: 5,
				batches_ids: [[batch_id]]
			});
			expect(res1.type).toBe('SUCCESS');
			if (res1.type != 'SUCCESS') return;

			const still_batch = await ingredient_production_service.getBatchById(batch_id);
			expect(still_batch?.state).toBe('AVAILABLE');

			const res2 = await product_service.closeProduction({ batch_id: res1.data.id, adjustment: 0 });

			expect(res2.type).toBe('SUCCESS');
			if (res2.type != 'SUCCESS') return;
		}

		const mod_batch = await ingredient_production_service.getBatchById(batch_id);
		expect(mod_batch?.state).toBe('EMPTY');
	});

	test('dont change state to EMPYT when production ends and stock>0', async () => {
		const batch_id = await purchases_defaulter_service
			.buy({
				supplier_id: SUPPLIER_ID,
				bought: [{ ingredient_id: LIVER_ID, initial_amount: 100 }]
			})
			.then(getFirst);

		const res1 = await product_service.startProduction({
			product_id: PRODUCT_ID,
			recipe: [{ ingredient_id: LIVER_ID, amount: 9 }], // << IMPORTANT!
			produced_amount: 10,
			batches_ids: [[batch_id]]
		});
		expect(res1.type).toBe('SUCCESS');
		if (res1.type != 'SUCCESS') return;

		const still_batch = await ingredient_production_service.getBatchById(batch_id);
		expect(still_batch?.state).toBe('AVAILABLE');

		const res2 = await product_service.closeProduction({ batch_id: res1.data.id, adjustment: 0 });

		expect(res2.type).toBe('SUCCESS');
		if (res2.type != 'SUCCESS') return;

		const mod_batch = await ingredient_production_service.getBatchById(batch_id);
		expect(mod_batch?.state).toBe('AVAILABLE');
	});

	test('production of product, empty the first batch but not the second', async () => {
		const batch_id_1 = await purchases_defaulter_service
			.buy({
				supplier_id: SUPPLIER_ID,
				bought: [{ ingredient_id: LIVER_ID, initial_amount: 100 }]
			})
			.then(getFirst);

		const batch_id_2 = await purchases_defaulter_service
			.buy({
				supplier_id: SUPPLIER_ID,
				bought: [{ ingredient_id: LIVER_ID, initial_amount: 10_000 }]
			})
			.then(getFirst);

		const res1 = await product_service.startProduction({
			product_id: PRODUCT_ID,
			recipe: [{ ingredient_id: LIVER_ID, amount: 12 }], // << IMPORTANT!
			produced_amount: 10,
			batches_ids: [[batch_id_1, batch_id_2]]
		});
		expect(res1.type).toBe('SUCCESS');
		if (res1.type != 'SUCCESS') return;

		for (const id of [batch_id_1, batch_id_2]) {
			const still_batch = await ingredient_production_service.getBatchById(id);
			expect(still_batch?.state).toBe('AVAILABLE');
		}

		const res2 = await product_service.closeProduction({ batch_id: res1.data.id, adjustment: 0 });

		expect(res2.type).toBe('SUCCESS');
		if (res2.type != 'SUCCESS') return;

		const mod_bathc_1 = await ingredient_production_service.getBatchById(batch_id_1);
		expect(mod_bathc_1?.state).toBe('EMPTY');

		const mod_batch_2 = await ingredient_production_service.getBatchById(batch_id_2);
		expect(mod_batch_2?.state).toBe('AVAILABLE');
	});

	test('production of product, empty both batches', async () => {
		const batch_id_1 = await purchases_defaulter_service
			.buy({
				supplier_id: SUPPLIER_ID,
				bought: [{ ingredient_id: LIVER_ID, initial_amount: 100 }]
			})
			.then(getFirst);

		const batch_id_2 = await purchases_defaulter_service
			.buy({
				supplier_id: SUPPLIER_ID,
				bought: [{ ingredient_id: LIVER_ID, initial_amount: 100 }]
			})
			.then(getFirst);

		const res1 = await product_service.startProduction({
			product_id: PRODUCT_ID,
			recipe: [{ ingredient_id: LIVER_ID, amount: 20 }], // << IMPORTANT!
			produced_amount: 10,
			batches_ids: [[batch_id_1, batch_id_2]]
		});
		expect(res1.type).toBe('SUCCESS');
		if (res1.type != 'SUCCESS') return;

		for (const id of [batch_id_1, batch_id_2]) {
			const still_batch = await ingredient_production_service.getBatchById(id);
			expect(still_batch?.state).toBe('AVAILABLE');
		}

		const res2 = await product_service.closeProduction({ batch_id: res1.data.id, adjustment: 0 });

		expect(res2.type).toBe('SUCCESS');
		if (res2.type != 'SUCCESS') return;

		for (const id of [batch_id_1, batch_id_2]) {
			const still_batch = await ingredient_production_service.getBatchById(id);
			expect(still_batch?.state).toBe('EMPTY');
		}
	});
});
