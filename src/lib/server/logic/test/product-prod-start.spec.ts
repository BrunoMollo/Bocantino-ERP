import { describe, expect, vi, test, beforeEach, beforeAll, afterEach, afterAll } from 'vitest';
import { INVOICE_TYPE, db } from '$lib/server/db/__mocks__';
import {
	t_document_type,
	t_product_batch,
	tr_product_batch_ingredient_batch
} from '$lib/server/db/schema';
import { ingredients_service, suppliers_service, purchases_service } from '$logic';
import { product_service } from '$logic/product-logic';
import { __DELETE_ALL_DATABASE } from './utils';
import { eq } from 'drizzle-orm';
import { getFirst } from '$lib/utils';

vi.mock('$lib/server/db/index.ts');

let LIVER_ID = -1;
let BANANA_ID = -1;
let SUPPLIER_ID = -1;
let REDUCED_LIVER_ID = -1;
let LIVER_BATCH_ID = -1;
let SECOND_LIVER_BATCH_ID = -1;
let BANANA_BATCH_ID = -1;
let FINAL_PRODUCT_ID = -1;

const LIVER_BATCH_INTIAL_AMOUNT = 100 as const;
const SECOND_LIVER_BATCH_INITIAL_AMOUNT = 200 as const;

beforeAll(async () => {
	await __DELETE_ALL_DATABASE();
	await db.insert(t_document_type).values(INVOICE_TYPE);

	LIVER_ID = await ingredients_service
		.add({
			name: 'Liver',
			unit: 'Kg',
			reorderPoint: 100
		})
		.then((x) => x.id);

	BANANA_ID = await ingredients_service
		.add({
			name: 'Banana',
			unit: 'Kg',
			reorderPoint: 120
		})
		.then((x) => x.id);

	SUPPLIER_ID = await suppliers_service
		.add({
			name: 'Juan',
			email: 'jj@gmail.com',
			ingredientsIds: [LIVER_ID, BANANA_ID]
		})
		.then((x) => x.id);

	REDUCED_LIVER_ID = await ingredients_service
		.add(
			{
				name: 'Liver reduced',
				unit: 'Kg',
				reorderPoint: 80
			},
			{
				id: LIVER_ID,
				amount: 2
			}
		)
		.then((x) => x.id);

	FINAL_PRODUCT_ID = await product_service
		.add({
			desc: 'Alimento para perros',
			ingredients: [{ id: LIVER_ID, amount: 10 }]
		})
		.then((x) => x.id);
});

beforeEach(async () => {
	await db.delete(tr_product_batch_ingredient_batch);
	await db.delete(t_product_batch);

	LIVER_BATCH_ID = await purchases_service
		.registerBoughtIngrediets({
			supplierId: SUPPLIER_ID,
			document: {
				number: '1234',
				typeId: INVOICE_TYPE.id,
				issue_date: new Date(),
				due_date: new Date()
			},
			batches: [
				{
					ingredientId: LIVER_ID,
					batch_code: 'SOME CODE',
					initialAmount: LIVER_BATCH_INTIAL_AMOUNT,
					numberOfBags: 10,
					cost: 1000,
					productionDate: new Date(),
					expiration_date: new Date()
				}
			]
		})
		.then((x) => x.batchesId[0]);

	SECOND_LIVER_BATCH_ID = await purchases_service
		.registerBoughtIngrediets({
			supplierId: SUPPLIER_ID,
			document: {
				number: '1234',
				typeId: INVOICE_TYPE.id,
				issue_date: new Date(),
				due_date: new Date()
			},
			batches: [
				{
					ingredientId: LIVER_ID,
					batch_code: 'SOME OTHER CODE',
					initialAmount: SECOND_LIVER_BATCH_INITIAL_AMOUNT,
					numberOfBags: 12,
					cost: 1000,
					productionDate: new Date(),
					expiration_date: new Date()
				}
			]
		})
		.then((x) => x.batchesId[0]);

	BANANA_BATCH_ID = await purchases_service
		.registerBoughtIngrediets({
			supplierId: SUPPLIER_ID,
			document: {
				number: '1234',
				typeId: INVOICE_TYPE.id,
				issue_date: new Date(),
				due_date: new Date()
			},
			batches: [
				{
					ingredientId: BANANA_ID,
					batch_code: 'SOME OTHER CODE FOR BANANA',
					initialAmount: 20,
					numberOfBags: 1,
					cost: 1000,
					productionDate: new Date(),
					expiration_date: new Date()
				}
			]
		})
		.then((x) => x.batchesId[0]);
});

describe.sequential('start production of derived ingredient_', async () => {
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
			expect(new_batch.batch_code).toBeTruthy(); //TODO: ask client
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
			expect(new_batch.batch_code).toBeTruthy(); //TODO: ask client
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
			expect(relation[0].ingredient_batch_id).toBe(LIVER_BATCH_ID);
			expect(relation[0].amount_used_to_produce_batch).toBe(LIVER_BATCH_INTIAL_AMOUNT);
			expect(relation[1].ingredient_batch_id).toBe(SECOND_LIVER_BATCH_ID);
			expect(relation[1].amount_used_to_produce_batch).toBe(SECOND_LIVER_BATCH_INITIAL_AMOUNT / 2);
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
			expect(new_batch.batch_code).toBeTruthy(); //TODO: ask client
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
			expect(relation[0].ingredient_batch_id).toBe(LIVER_BATCH_ID);
			expect(relation[0].amount_used_to_produce_batch).toBe(LIVER_BATCH_INTIAL_AMOUNT);
			expect(relation[1].ingredient_batch_id).toBe(SECOND_LIVER_BATCH_ID);
			expect(relation[1].amount_used_to_produce_batch).toBe(20 * 12 - LIVER_BATCH_INTIAL_AMOUNT);
			expect(relation[2].ingredient_batch_id).toBe(BANANA_BATCH_ID);
			expect(relation[2].amount_used_to_produce_batch).toBe(1 * 12);
		}
	});
});

