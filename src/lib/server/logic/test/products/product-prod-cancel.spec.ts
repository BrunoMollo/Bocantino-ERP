import { describe, expect, vi, test, beforeEach, beforeAll } from 'vitest';
import { INVOICE_TYPE, db } from '$lib/server/db/__mocks__';
import {
	t_document_type,
	t_product_batch,
	tr_product_batch_ingredient_batch
} from '$lib/server/db/schema';
import { product_service } from '$logic/product-service';
import { __DELETE_ALL_DATABASE } from '../utils';
import { suppliers_service } from '$logic/suppliers-service';
import { purchases_service } from '$logic/ingredient-purchase-service';
import { ingredients_service } from '$logic/ingredient-service';

vi.mock('$lib/server/db/index.ts');

let LIVER_ID = -1;
let BANANA_ID = -1;
let SUPPLIER_ID = -1;
let LIVER_PRODUCT_ID = -1;

let LIVER_BATCH_ID = -1;
let BANANA_BATCH_ID = -1;
let LIVER_PRODUCT_BATCH_ID = -1;

beforeAll(async () => {
	await __DELETE_ALL_DATABASE();
	await db.insert(t_document_type).values(INVOICE_TYPE);

	LIVER_ID = await ingredients_service
		.add({
			name: 'Liver',
			unit: 'Kg',
			reorder_point: 100
		})
		.then((x) => x.id);

	BANANA_ID = await ingredients_service
		.add({
			name: 'Banana',
			unit: 'Kg',
			reorder_point: 120
		})
		.then((x) => x.id);

	SUPPLIER_ID = await suppliers_service
		.add({
			name: 'Juan',
			email: 'jj@gmail.com',
			ingredientsIds: [LIVER_ID, BANANA_ID]
		})
		.then((x) => x.id);

	LIVER_PRODUCT_ID = await product_service
		.add({
			desc: 'Alimento para perros',
			ingredients: [{ ingredient_id: LIVER_ID, amount: 10 }]
		})
		.then((x) => x.id);

	[LIVER_BATCH_ID, BANANA_BATCH_ID] = await purchases_service
		.registerBoughtIngrediets({
			perceptions_tax_amount: 10,
			iva_tax_percentage: 21,
			supplier_id: SUPPLIER_ID,
			document: {
				number: '1234',
				typeId: INVOICE_TYPE.id,
				issue_date: new Date(),
				due_date: new Date()
			},
			batches: [
				{
					ingredient_id: LIVER_ID,
					batch_code: 'SOME OTHER CODE FOR BANANA',
					initial_amount: 20_000,
					number_of_bags: 1,
					cost: 1000,
					production_date: new Date(),
					expiration_date: new Date()
				},
				{
					ingredient_id: BANANA_ID,
					batch_code: 'SOME OTHER CODE FOR BANANA',
					initial_amount: 10_000,
					number_of_bags: 1,
					cost: 1000,
					production_date: new Date(),
					expiration_date: new Date()
				}
			]
		})
		.then((x) => x.batchesId);
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
		const res = await product_service.deleteBatchById(non_existing_id);
		expect(res.type).toBe('LOGIC_ERROR');
		const batches = await db.select().from(t_product_batch);
		expect(batches.length).toBe(2);
	});

	test('delete batch when is in_production', async () => {
		const res = await product_service.deleteBatchById(LIVER_PRODUCT_BATCH_ID);
		expect(res.type).toBe('SUCCESS');
		await db.select().from(t_product_batch);
		const batches = await db.select().from(t_product_batch);
		expect(batches.length).toBe(1);
	});

	test('error when produciton is already closed', async () => {
		await product_service.closeProduction({ batch_id: LIVER_PRODUCT_BATCH_ID, adjustment: -1 });
		const res = await product_service.deleteBatchById(LIVER_PRODUCT_BATCH_ID);
		expect(res.type).toBe('LOGIC_ERROR');
		await db.select().from(t_product_batch);
		const batches = await db.select().from(t_product_batch);
		expect(batches.length).toBe(2);
	});
});

