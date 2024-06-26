import { describe, expect, vi, test, beforeEach, beforeAll } from 'vitest';
import { db } from '$lib/server/db/__mocks__';
import {
	t_entry_document,
	t_ingredient,
	t_ingredient_batch,
	t_ingridient_entry,
	t_product_batch,
	t_supplier,
	tr_ingredient_batch_ingredient_batch,
	tr_product_batch_ingredient_batch,
	tr_supplier_ingredient
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getFirst } from '$lib/utils';
import { pick_columns } from 'drizzle-tools';
import { __DELETE_ALL_DATABASE } from '../utils';
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
let BATCH_IN_PROD_ID = -1;

const LIVER_BATCH_INTIAL_AMOUNT = 100 as const;
const SECOND_LIVER_BATCH_INITIAL_AMOUNT = 200 as const;

beforeAll(async () => {
	await __DELETE_ALL_DATABASE();
	LIVER_ID = await ingredient_defaulter_service.add_simple();
	BANANA_ID = await ingredient_defaulter_service.add_simple();
	REDUCED_LIVER_ID = await ingredient_defaulter_service.add_derived({ from: LIVER_ID, amount: 2 });

	SUPPLIER_ID = await suppliers_defaulter_service.add({ ingredientsIds: [LIVER_ID, BANANA_ID] });
});

beforeEach(async () => {
	await db.delete(tr_product_batch_ingredient_batch);
	await db.delete(t_product_batch);
	await db.delete(tr_ingredient_batch_ingredient_batch);
	await db.delete(t_ingredient_batch);
	await db.delete(t_entry_document);
	await db.delete(t_ingridient_entry);

	[LIVER_BATCH_ID] = await purchases_defaulter_service.buy({
		supplier_id: SUPPLIER_ID,
		bought: [{ ingredient_id: LIVER_ID, initial_amount: LIVER_BATCH_INTIAL_AMOUNT }]
	});

	await purchases_defaulter_service.buy({
		supplier_id: SUPPLIER_ID,
		bought: [{ ingredient_id: LIVER_ID, initial_amount: SECOND_LIVER_BATCH_INITIAL_AMOUNT }]
	});

	await purchases_defaulter_service.buy({
		supplier_id: SUPPLIER_ID,
		bought: [{ ingredient_id: BANANA_ID, initial_amount: 20 }]
	});

	const batch = await ingredient_production_service.startIngredientProduction(
		{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 10 },
		[LIVER_BATCH_ID]
	);
	//@ts-expect-error PENDING: explain
	BATCH_IN_PROD_ID = batch.id;
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
		expect(batches.length).toBe(4);
	});
	test('not found batch_id', async () => {
		const res = await ingredient_production_service.closeProduction({
			batch_id: 1000,
			adjustment: 10
		});
		expect(res.type).toBe('LOGIC_ERROR');
	});

	test('update batch', async () => {
		const res = await ingredient_production_service.closeProduction({
			batch_id: BATCH_IN_PROD_ID,
			adjustment: 10
		});
		expect(res.type).toBe('SUCCESS');
		const { batch } = await db
			.select({
				batch: pick_columns(t_ingredient_batch, 'state', 'production_date', 'adjustment')
			})
			.from(t_ingredient_batch)
			.where(eq(t_ingredient_batch.id, BATCH_IN_PROD_ID))
			.then(getFirst);
		expect(batch.adjustment).toBe(10);
		expect(batch.state).toBe('AVAILABLE');
		expect(batch.production_date).toBeTruthy();
	});
});
