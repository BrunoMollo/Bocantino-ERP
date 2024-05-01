import { describe, expect, vi, test, beforeAll } from 'vitest';
import { db } from '$lib/server/db/__mocks__';
import {
	t_ingredient,
	t_ingredient_batch,
	t_supplier,
	tr_supplier_ingredient
} from '$lib/server/db/schema';
import { __DELETE_ALL_DATABASE } from './utils';
import { ingredient_production_service } from '$logic/ingredient-production-service';
import { ingredient_defaulter_service } from '$logic/defaulters/ingredient-service.default';
import { suppliers_defaulter_service } from '$logic/defaulters/supplier-service.default';
import { purchases_defaulter_service } from '$logic/defaulters/purchase-service.default';

vi.mock('$lib/server/db/index.ts');

let LIVER_ID = -1;
let BANANA_ID = -1;
let SUPPLIER_ID = -1;
let REDUCED_LIVER_ID = -1;
let LIVER_BATCH_ID = -1;
let SECOND_LIVER_BATCH_ID = -1;
let BANANA_BATCH_ID = -1;
let BATCH_IN_PROD_ID = -1;

const LIVER_BATCH_INTIAL_AMOUNT = 100 as const;
const SECOND_LIVER_BATCH_INITIAL_AMOUNT = 200 as const;
beforeAll(async () => {
	await __DELETE_ALL_DATABASE();

	LIVER_ID = await ingredient_defaulter_service.add_simple();
	BANANA_ID = await ingredient_defaulter_service.add_simple();
	REDUCED_LIVER_ID = await ingredient_defaulter_service.add_derived({ from: LIVER_ID, amount: 2 });

	SUPPLIER_ID = await suppliers_defaulter_service.add({ ingredientsIds: [LIVER_ID, BANANA_ID] });

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

	const batch = await ingredient_production_service.startIngredientProduction(
		{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 10 },
		[LIVER_BATCH_ID]
	);
	//@ts-expect-error PENDING: explain
	BATCH_IN_PROD_ID = batch.id;

	const finished_batch = await ingredient_production_service.startIngredientProduction(
		{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 10 },
		[LIVER_BATCH_ID]
	);

	//@ts-expect-error PENDING: explain
	const batch_id: number = finished_batch.id;
	await ingredient_production_service.closeProduction({
		batch_id,
		adjustment: -2
	});
});

describe.sequential('start production of derived ingredient', async () => {
	test('testing initals conditions ok', async () => {
		expect(LIVER_BATCH_ID).toBeTruthy();
		const ingredients = await db.select().from(t_ingredient);
		expect(ingredients.length).toBe(3);
		expect(ingredients.filter((x) => x.id === LIVER_ID).length).toBe(1);
		expect(ingredients.filter((x) => x.id === REDUCED_LIVER_ID).length).toBe(1);

		const suppliers = await db.select().from(t_supplier);
		expect(suppliers.length).toBe(1);
		expect(suppliers[0].id).toBe(SUPPLIER_ID);

		const rel_sup_ingred = await db.select().from(tr_supplier_ingredient);
		expect(rel_sup_ingred.length).toBe(2);
		expect(rel_sup_ingred[0].supplier_id).toBe(SUPPLIER_ID);
		expect(rel_sup_ingred[0].ingredient_id).toBe(LIVER_ID);

		const batches = await db.select().from(t_ingredient_batch);
		expect(batches.length).toBe(5);
	});
	describe.sequential('getBatchById', () => {
		test('get liver', async () => {
			const res = await ingredient_production_service.getBatchById(LIVER_BATCH_ID);
			expect(res?.current_amount).toEqual(60);
		});

		test('get second liver', async () => {
			const res = await ingredient_production_service.getBatchById(SECOND_LIVER_BATCH_ID);
			expect(res?.current_amount).toEqual(200);
		});

		test('get in prod bacth', async () => {
			const res = await ingredient_production_service.getBatchById(BATCH_IN_PROD_ID);
			expect(res?.current_amount).toEqual(null);
		});

		test('get Banana', async () => {
			const res = await ingredient_production_service.getBatchById(BANANA_BATCH_ID);
			expect(res?.current_amount).toEqual(20);
		});
	});

	describe.sequential('getBatchesIngredientById', () => {
		test('get Banana batches', async () => {
			const res = await ingredient_production_service.getBatchesByingredient_id(BANANA_ID);
			expect(res.length).toBe(1);
			expect(res[0]?.current_amount).toEqual(20);
		});

		test('get Liver batches', async () => {
			const res = await ingredient_production_service.getBatchesByingredient_id(LIVER_ID);
			expect(res.length).toBe(2);
			{
				const batch = res.find((x) => x.id === LIVER_BATCH_ID);
				expect(batch?.current_amount).toEqual(60);
			}

			{
				const batch = res.find((x) => x.id === SECOND_LIVER_BATCH_ID);
				expect(batch?.current_amount).toEqual(200);
			}
		});

		test('get Reduced Liver batches', async () => {
			const res = await ingredient_production_service.getBatchesByingredient_id(REDUCED_LIVER_ID);
			expect(res.length).toBe(1);
			expect(res[0]?.current_amount).toEqual(8);
		});
	});
});
