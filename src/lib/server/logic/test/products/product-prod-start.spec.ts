import { describe, expect, vi, test, beforeEach, beforeAll } from 'vitest';
import { INVOICE_TYPE, db } from '$lib/server/db/__mocks__';
import {
	t_document_type,
	t_entry_document,
	t_ingredient_batch,
	t_ingridient_entry,
	t_product_batch,
	tr_product_batch_ingredient_batch
} from '$lib/server/db/schema';
import { product_service } from '$logic/product-service';
import { __DELETE_ALL_DATABASE } from '../utils';
import { eq } from 'drizzle-orm';
import { getFirst } from '$lib/utils';
import { ingredient_defaulter_service } from '$logic/defaulters/ingredient-service.default';
import { suppliers_defaulter_service } from '$logic/defaulters/supplier-service.default';
import { purchases_defaulter_service } from '$logic/defaulters/purchase-service.default';
import { ingredient_production_service } from '$logic/ingredient-production-service';

vi.mock('$lib/server/db/index.ts');

let LIVER_ID = -1;
let BANANA_ID = -1;
let SUPPLIER_ID = -1;
let LIVER_BATCH_ID = -1;
let SECOND_LIVER_BATCH_ID = -1;
let BANANA_BATCH_ID = -1;
let FINAL_PRODUCT_ID = -1;

const LIVER_BATCH_INTIAL_AMOUNT = 100 as const;
const SECOND_LIVER_BATCH_INITIAL_AMOUNT = 200 as const;

beforeAll(async () => {
	await __DELETE_ALL_DATABASE();
	await db.insert(t_document_type).values(INVOICE_TYPE);

	LIVER_ID = await ingredient_defaulter_service.add_simple();
	BANANA_ID = await ingredient_defaulter_service.add_simple();
	await ingredient_defaulter_service.add_derived({ from: LIVER_ID, amount: 2 });

	SUPPLIER_ID = await suppliers_defaulter_service.add({ ingredientsIds: [LIVER_ID, BANANA_ID] });

	FINAL_PRODUCT_ID = await product_service
		.add({
			desc: 'Alimento para perros',
			ingredients: [{ ingredient_id: LIVER_ID, amount: 10 }]
		})
		.then((x) => x.id);
});

beforeEach(async () => {
	await db.delete(tr_product_batch_ingredient_batch);
	await db.delete(t_product_batch);
	await db.delete(t_ingredient_batch);
	await db.delete(t_entry_document);
	await db.delete(t_ingridient_entry);

	[LIVER_BATCH_ID] = await purchases_defaulter_service.buy({
		supplier_id: SUPPLIER_ID,
		bought: [{ ingredient_id: LIVER_ID, initial_amount: LIVER_BATCH_INTIAL_AMOUNT }]
	});

	[SECOND_LIVER_BATCH_ID] = await purchases_defaulter_service.buy({
		supplier_id: SUPPLIER_ID,
		bought: [{ ingredient_id: LIVER_ID, initial_amount: SECOND_LIVER_BATCH_INITIAL_AMOUNT }]
	});

	[BANANA_BATCH_ID] = await purchases_defaulter_service.buy({
		supplier_id: SUPPLIER_ID,
		bought: [{ ingredient_id: BANANA_ID, initial_amount: 20 }]
	});
});

describe.sequential('start production of product', async () => {
	test('error if product does not exist', async () => {
		const non_existing_id = FINAL_PRODUCT_ID * 100;
		const res = await product_service.startProduction({
			product_id: non_existing_id,
			produced_amount: 10,
			recipe: [{ amount: 10, ingredient_id: LIVER_ID }],
			batches_ids: [[LIVER_BATCH_ID]]
		});
		expect(res.type).toBe('LOGIC_ERROR');
	});

	test('error grouped batches dont have the same ingredient type', async () => {
		const res = await product_service.startProduction({
			product_id: FINAL_PRODUCT_ID,
			produced_amount: 10,
			recipe: [{ amount: 10, ingredient_id: LIVER_ID }],
			batches_ids: [[LIVER_BATCH_ID, BANANA_BATCH_ID]]
		});
		expect(res.type).toBe('LOGIC_ERROR');
	});

	test('error when batch does not exist', async () => {
		const non_existent_batch_id = LIVER_BATCH_ID * 100;
		const res = await product_service.startProduction({
			product_id: FINAL_PRODUCT_ID,
			produced_amount: 10,
			recipe: [{ amount: 10, ingredient_id: LIVER_ID }],
			batches_ids: [[non_existent_batch_id]]
		});
		expect(res.type).toBe('LOGIC_ERROR');
	});

	test('error when grouped batches does not have same ingredient', async () => {
		const res = await product_service.startProduction({
			product_id: FINAL_PRODUCT_ID,
			produced_amount: 10,
			recipe: [{ amount: 10, ingredient_id: LIVER_ID }],
			batches_ids: [[LIVER_BATCH_ID, BANANA_BATCH_ID]]
		});
		expect(res.type).toBe('LOGIC_ERROR');
	});

	test('error when insuficient stock, one batch', async () => {
		const res = await product_service.startProduction({
			product_id: FINAL_PRODUCT_ID,
			produced_amount: 10,
			recipe: [{ amount: 100000, ingredient_id: LIVER_ID }],
			batches_ids: [[LIVER_BATCH_ID]]
		});
		expect(res.type).toBe('LOGIC_ERROR');
	});

	test('error when insuficient stock, two batch', async () => {
		const res = await product_service.startProduction({
			product_id: FINAL_PRODUCT_ID,
			produced_amount: 2,
			recipe: [{ amount: 400, ingredient_id: LIVER_ID }],
			batches_ids: [[LIVER_BATCH_ID, SECOND_LIVER_BATCH_ID]]
		});
		expect(res.type).toBe('LOGIC_ERROR');
	});

	test('use baches in the correct order, use the one that have less first (case 1, input)', async () => {
		const res = await product_service.startProduction({
			product_id: FINAL_PRODUCT_ID,
			produced_amount: 1,
			recipe: [
				{
					amount: LIVER_BATCH_INTIAL_AMOUNT + SECOND_LIVER_BATCH_INITIAL_AMOUNT / 2, //100 + 200/2 = 200
					ingredient_id: LIVER_ID
				}
			],
			batches_ids: [[LIVER_BATCH_ID, SECOND_LIVER_BATCH_ID]] // order case 1
		});
		expect(res.type).toBe('SUCCESS');
		const b1 = await ingredient_production_service.getBatchById(LIVER_BATCH_ID);
		expect(b1?.current_amount).toBe(0); // from 100 to 0

		const b2 = await ingredient_production_service.getBatchById(SECOND_LIVER_BATCH_ID);
		expect(b2?.current_amount).toBe(100); // from 200 to 100
	});

	test('use baches in the correct order, use the one that have less first (case 2, input)', async () => {
		const res = await product_service.startProduction({
			product_id: FINAL_PRODUCT_ID,
			produced_amount: 1,
			recipe: [
				{
					amount: LIVER_BATCH_INTIAL_AMOUNT + SECOND_LIVER_BATCH_INITIAL_AMOUNT / 2, //100 + 200/2 = 200
					ingredient_id: LIVER_ID
				}
			],
			batches_ids: [[SECOND_LIVER_BATCH_ID, LIVER_BATCH_ID]] // order case 2
		});
		expect(res.type).toBe('SUCCESS');
		const b1 = await ingredient_production_service.getBatchById(LIVER_BATCH_ID);
		expect(b1?.current_amount).toBe(0); // from 100 to 0

		const b2 = await ingredient_production_service.getBatchById(SECOND_LIVER_BATCH_ID);
		expect(b2?.current_amount).toBe(100); // from 200 to 100
	});

	test('use baches in the correct order, use the one that have less first (case 1, db)', async () => {
		const [liver_batch_id] = await purchases_defaulter_service.buy({
			supplier_id: SUPPLIER_ID,
			bought: [{ ingredient_id: LIVER_ID, initial_amount: 400 }]
		});

		const [second_liver_batch_id] = await purchases_defaulter_service.buy({
			supplier_id: SUPPLIER_ID,
			bought: [{ ingredient_id: LIVER_ID, initial_amount: 200 }]
		});
		const res = await product_service.startProduction({
			product_id: FINAL_PRODUCT_ID,
			produced_amount: 1,
			recipe: [
				{
					amount: 200 + 400 / 2, // = 400
					ingredient_id: LIVER_ID
				}
			],
			batches_ids: [[second_liver_batch_id, liver_batch_id]]
		});
		expect(res.type).toBe('SUCCESS');

		const b2 = await ingredient_production_service.getBatchById(second_liver_batch_id);
		expect(b2?.current_amount).toBe(0); // from 200 to 0

		const b1 = await ingredient_production_service.getBatchById(liver_batch_id);
		expect(b1?.current_amount).toBe(200); // from 400 to 200
	});

	test('use baches in the correct order, use the one that have less first (case 2, db)', async () => {
		const [second_liver_batch_id] = await purchases_defaulter_service.buy({
			supplier_id: SUPPLIER_ID,
			bought: [{ ingredient_id: LIVER_ID, initial_amount: 200 }]
		});

		const [liver_batch_id] = await purchases_defaulter_service.buy({
			supplier_id: SUPPLIER_ID,
			bought: [{ ingredient_id: LIVER_ID, initial_amount: 400 }]
		});
		const res = await product_service.startProduction({
			product_id: FINAL_PRODUCT_ID,
			produced_amount: 1,
			recipe: [
				{
					amount: 200 + 400 / 2, // = 400
					ingredient_id: LIVER_ID
				}
			],
			batches_ids: [[second_liver_batch_id, liver_batch_id]]
		});
		expect(res.type).toBe('SUCCESS');

		const b2 = await ingredient_production_service.getBatchById(second_liver_batch_id);
		expect(b2?.current_amount).toBe(0); // from 200 to 0

		const b1 = await ingredient_production_service.getBatchById(liver_batch_id);
		expect(b1?.current_amount).toBe(200); // from 400 to 200
	});

	test('error when insuficient stock, one batch one ingredient an two batches another, insuficient one', async () => {
		const res = await product_service.startProduction({
			product_id: FINAL_PRODUCT_ID,
			produced_amount: 3,
			recipe: [
				{ amount: 100, ingredient_id: LIVER_ID },
				{ amount: 100, ingredient_id: BANANA_ID }
			],
			batches_ids: [[BANANA_BATCH_ID], [LIVER_BATCH_ID, SECOND_LIVER_BATCH_ID]]
		});
		expect(res.type).toBe('LOGIC_ERROR');
	});

	test('error when insuficient stock, one batch one ingredient an two batches another, insuficient one', async () => {
		const res = await product_service.startProduction({
			product_id: FINAL_PRODUCT_ID,
			produced_amount: 2,
			recipe: [
				{ amount: 200, ingredient_id: LIVER_ID },
				{ amount: 10, ingredient_id: BANANA_ID }
			],
			batches_ids: [[BANANA_BATCH_ID], [LIVER_BATCH_ID, SECOND_LIVER_BATCH_ID]]
		});
		expect(res.type).toBe('LOGIC_ERROR');
	});

	test('start production with one ingredient and one batch', async () => {
		const date = new Date(2000, 1, 1);
		vi.setSystemTime(date);

		const res = await product_service.startProduction({
			product_id: FINAL_PRODUCT_ID,
			produced_amount: 2,
			recipe: [{ amount: 10, ingredient_id: BANANA_ID }],
			batches_ids: [[BANANA_BATCH_ID]]
		});
		expect(res.type).toBe('SUCCESS');
		if (res.type == 'SUCCESS') {
			const new_batch = await db
				.select()
				.from(t_product_batch)
				.where(eq(t_product_batch.id, res.data.id))
				.then(getFirst);
			expect(new_batch.batch_code).toContain('BOC');
			expect(new_batch.batch_code).toContain(new_batch.id);
			expect(new_batch.product_id).toBe(FINAL_PRODUCT_ID);
			expect(new_batch.expiration_date.toISOString().split('T')[0]).toEqual(
				new Date(2000, 7, 1).toISOString().split('T')[0]
			); //plus 6 months
			expect(new_batch.production_date).toBe(null);
			expect(new_batch.state).toBe('IN_PRODUCTION');
			expect(new_batch.adjustment).toBe(null);
			expect(new_batch.initial_amount).toBe(2);
			expect(new_batch.registration_date).toEqual(new Date(2000, 1, 1));

			const relation = await db
				.select()
				.from(tr_product_batch_ingredient_batch)
				.where(eq(tr_product_batch_ingredient_batch.produced_batch_id, new_batch.id));
			expect(relation.length).toBe(1);
			expect(relation[0].ingredient_batch_id).toBe(BANANA_BATCH_ID);
			expect(relation[0].amount_used_to_produce_batch).toBe(2 * 10);
		}
	});

	test('start production with one ingredient and two batches', async () => {
		const date = new Date(2000, 1, 1);
		vi.setSystemTime(date);

		const produced_amount =
			0.1 * (LIVER_BATCH_INTIAL_AMOUNT + SECOND_LIVER_BATCH_INITIAL_AMOUNT / 2);
		const res = await product_service.startProduction({
			product_id: FINAL_PRODUCT_ID,
			produced_amount,
			recipe: [{ amount: 10, ingredient_id: LIVER_ID }],
			batches_ids: [[LIVER_BATCH_ID, SECOND_LIVER_BATCH_ID]]
		});

		expect(res.type).toBe('SUCCESS');
		if (res.type == 'SUCCESS') {
			const new_batch = await db
				.select()
				.from(t_product_batch)
				.where(eq(t_product_batch.id, res.data.id))
				.then(getFirst);
			expect(new_batch.batch_code).toContain('BOC');
			expect(new_batch.batch_code).toContain(new_batch.id);
			expect(new_batch.product_id).toBe(FINAL_PRODUCT_ID);
			expect(new_batch.expiration_date.toISOString().split('T')[0]).toEqual(
				new Date(2000, 7, 1).toISOString().split('T')[0]
			); //plus 6 months
			expect(new_batch.production_date).toBe(null);
			expect(new_batch.state).toBe('IN_PRODUCTION');
			expect(new_batch.adjustment).toBe(null);
			expect(new_batch.initial_amount).toBe(produced_amount);
			expect(new_batch.registration_date).toEqual(new Date(2000, 1, 1));

			const relation = await db
				.select()
				.from(tr_product_batch_ingredient_batch)
				.where(eq(tr_product_batch_ingredient_batch.produced_batch_id, new_batch.id));
			expect(relation.length).toBe(2);
			{
				const rel = relation.find((x) => x.ingredient_batch_id === LIVER_BATCH_ID);
				expect(rel).toBeTruthy();
				expect(rel?.produced_batch_id).toBe(new_batch.id);
				expect(rel?.amount_used_to_produce_batch).toBe(LIVER_BATCH_INTIAL_AMOUNT);
			}
			{
				const rel = relation.find((x) => x.ingredient_batch_id === SECOND_LIVER_BATCH_ID);
				expect(rel).toBeTruthy();
				expect(rel?.produced_batch_id).toBe(new_batch.id);
				expect(rel?.amount_used_to_produce_batch).toBe(SECOND_LIVER_BATCH_INITIAL_AMOUNT / 2);
			}
		}
	});

	test('start production with two ingredient, first with two batches and second one batch', async () => {
		const date = new Date(2000, 1, 1);
		vi.setSystemTime(date);

		const res = await product_service.startProduction({
			product_id: FINAL_PRODUCT_ID,
			produced_amount: 12,
			recipe: [
				{ amount: 20, ingredient_id: LIVER_ID },
				{ amount: 1, ingredient_id: BANANA_ID }
			],
			batches_ids: [[LIVER_BATCH_ID, SECOND_LIVER_BATCH_ID], [BANANA_BATCH_ID]]
		});

		expect(res.type).toBe('SUCCESS');
		if (res.type == 'SUCCESS') {
			const new_batch = await db
				.select()
				.from(t_product_batch)
				.where(eq(t_product_batch.id, res.data.id))
				.then(getFirst);

			expect(new_batch.batch_code).toContain('BOC');
			expect(new_batch.batch_code).toContain(new_batch.id);
			expect(new_batch.product_id).toBe(FINAL_PRODUCT_ID);
			expect(new_batch.expiration_date.toISOString().split('T')[0]).toEqual(
				new Date(2000, 7, 1).toISOString().split('T')[0]
			); //plus 6 months
			expect(new_batch.production_date).toBe(null);
			expect(new_batch.state).toBe('IN_PRODUCTION');
			expect(new_batch.adjustment).toBe(null);
			expect(new_batch.initial_amount).toBe(12);
			expect(new_batch.registration_date).toEqual(new Date(2000, 1, 1));

			const relation = await db
				.select()
				.from(tr_product_batch_ingredient_batch)
				.where(eq(tr_product_batch_ingredient_batch.produced_batch_id, new_batch.id));

			expect(relation.length).toBe(3);
			{
				const rel = relation.find((x) => x.ingredient_batch_id === LIVER_BATCH_ID);
				expect(rel).toBeTruthy();
				expect(rel?.produced_batch_id).toBe(new_batch.id);
				expect(rel?.amount_used_to_produce_batch).toBe(LIVER_BATCH_INTIAL_AMOUNT);
			}

			{
				const rel = relation.find((x) => x.ingredient_batch_id === SECOND_LIVER_BATCH_ID);
				expect(rel).toBeTruthy();
				expect(rel?.produced_batch_id).toBe(new_batch.id);
				expect(rel?.amount_used_to_produce_batch).toBe(20 * 12 - LIVER_BATCH_INTIAL_AMOUNT);
			}

			{
				const rel = relation.find((x) => x.ingredient_batch_id === BANANA_BATCH_ID);
				expect(rel).toBeTruthy();
				expect(rel?.produced_batch_id).toBe(new_batch.id);
				expect(rel?.amount_used_to_produce_batch).toBe(1 * 12);
			}
		}
	});
});
