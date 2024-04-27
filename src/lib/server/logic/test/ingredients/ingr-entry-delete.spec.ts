import { describe, vi, test, expect, beforeEach, beforeAll } from 'vitest';
import { db } from '$lib/server/db/__mocks__';
import {
	t_entry_document,
	t_ingredient_batch,
	t_ingridient_entry,
	tr_ingredient_batch_ingredient_batch
} from '$lib/server/db/schema';
import { __DELETE_ALL_DATABASE } from '../utils';
import { ingredient_defaulter_service } from '$logic/defaulters/ingredient-service.default';
import { suppliers_defaulter_service } from '$logic/defaulters/supplier-service.default';
import { purchases_defaulter_service } from '$logic/defaulters/purchase-service.default';
import { purchases_service } from '$logic/ingredient-purchase-service';
import { eq } from 'drizzle-orm';
import { getFirst } from '$lib/utils';
import { ingredient_production_service } from '$logic/ingredient-production-service';
import type { PgTable } from 'drizzle-orm/pg-core';
import { product_service_defaulter } from '$logic/defaulters/product-service.default';
import { product_service } from '$logic/product-service';

vi.mock('$lib/server/db/index.ts');

let BANANA_ID = -1;
let REDUCED_BANANA_ID = -1;
let SUPPLIER_ID = -1;
let ENTRY_ID = -1;
let ENTRY_ID_2 = -1;
let FINAL_PRODUCT_ID = -1;

beforeAll(async () => {
	await __DELETE_ALL_DATABASE();
	BANANA_ID = await ingredient_defaulter_service.add_simple();
	REDUCED_BANANA_ID = await ingredient_defaulter_service.add_derived({
		from: BANANA_ID,
		amount: 1
	});
	FINAL_PRODUCT_ID = await product_service_defaulter.add([{ ingredient_id: BANANA_ID, amount: 1 }]);

	SUPPLIER_ID = await suppliers_defaulter_service.add({ ingredientsIds: [BANANA_ID] });
});

beforeEach(async () => {
	await db.delete(tr_ingredient_batch_ingredient_batch);
	await db.delete(t_ingredient_batch);
	await db.delete(t_entry_document);
	await db.delete(t_ingridient_entry);
	await db.delete(t_ingridient_entry);

	ENTRY_ID = await purchases_defaulter_service.buy_return_entry_id({
		supplier_id: SUPPLIER_ID,
		bought: [{ ingredient_id: BANANA_ID, initial_amount: 20 }]
	});

	ENTRY_ID_2 = await purchases_defaulter_service.buy_return_entry_id({
		supplier_id: SUPPLIER_ID,
		bought: [
			{ ingredient_id: BANANA_ID, initial_amount: 100 },
			{ ingredient_id: BANANA_ID, initial_amount: 200 }
		]
	});

	await purchases_defaulter_service.buy_return_entry_id({
		supplier_id: SUPPLIER_ID,
		bought: [{ ingredient_id: BANANA_ID, initial_amount: 55 }]
	});
});

async function check_tables(arr: [PgTable, number][]) {
	arr.forEach(async ([table, count]) => {
		await db
			.select()
			.from(table)
			.then((x) => expect(x.length).toBe(count));
	});
}
function check_that_nothing_has_been_deleted() {
	check_tables([
		[t_ingredient_batch, 4],
		[t_entry_document, 3],
		[t_ingridient_entry, 3]
	]);
}
describe.sequential('delete ingredient entry', () => {
	test('initial conditions', async () => {
		check_that_nothing_has_been_deleted();
	});

	test('return error when entry does not exist', async () => {
		const res = await purchases_service.deleteEntryById(ENTRY_ID + 100);
		expect(res.type).toBe('LOGIC_ERROR');
		check_that_nothing_has_been_deleted();
	});

	test('entry with one batch is deleted succesfuly', async () => {
		const res = await purchases_service.deleteEntryById(ENTRY_ID);
		expect(res.type).toBe('SUCCESS');
		const entry_1 = await db
			.select()
			.from(t_ingridient_entry)
			.where(eq(t_ingridient_entry.id, ENTRY_ID));
		expect(entry_1.length).toBe(0);
		const entry_2 = await db
			.select()
			.from(t_ingridient_entry)
			.where(eq(t_ingridient_entry.id, ENTRY_ID_2));
		expect(entry_2.length).toBe(1);
	});

	test('entry with many batches is deleted succesfuly', async () => {
		const res = await purchases_service.deleteEntryById(ENTRY_ID_2);
		expect(res.type).toBe('SUCCESS');
		const entry_1 = await db
			.select()
			.from(t_ingridient_entry)
			.where(eq(t_ingridient_entry.id, ENTRY_ID_2));
		expect(entry_1.length).toBe(0);
		const entry_2 = await db
			.select()
			.from(t_ingridient_entry)
			.where(eq(t_ingridient_entry.id, ENTRY_ID));
		expect(entry_2.length).toBe(1);
	});

	test('return error if one batch is used in produciton of ingredient', async () => {
		const batch_of_entry = await db
			.select()
			.from(t_ingredient_batch)
			.where(eq(t_ingredient_batch.entry_id, ENTRY_ID))
			.then(getFirst);

		await ingredient_production_service
			.startIngredientProduction({ ingedient_id: REDUCED_BANANA_ID, produced_amount: 10 }, [
				batch_of_entry.id
			])
			.then((x) => expect(x.type).toBe('SUCCESS'));

		const res = await purchases_service.deleteEntryById(ENTRY_ID);
		expect(res.type).toBe('LOGIC_ERROR');

		check_tables([
			[t_ingredient_batch, 4 + 1],
			[t_entry_document, 3],
			[t_ingridient_entry, 3]
		]);
	});

	test('return error if one batch is used in produciton of product', async () => {
		const batch_of_entry = await db
			.select()
			.from(t_ingredient_batch)
			.where(eq(t_ingredient_batch.entry_id, ENTRY_ID))
			.then(getFirst);

		await product_service
			.startProduction({
				product_id: FINAL_PRODUCT_ID,
				produced_amount: 2,
				recipe: [{ amount: 1, ingredient_id: BANANA_ID }],
				batches_ids: [[batch_of_entry.id]]
			})
			.then((x) => expect(x.type).toBe('SUCCESS'));

		const res = await purchases_service.deleteEntryById(ENTRY_ID);
		expect(res.type).toBe('LOGIC_ERROR');

		check_that_nothing_has_been_deleted();
	});
});
