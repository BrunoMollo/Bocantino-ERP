import { describe, vi, test, expect, beforeEach, beforeAll } from 'vitest';
import { INVOICE_TYPE, db } from '$lib/server/db/__mocks__';
import {
	t_document_type,
	t_entry_document,
	t_ingredient,
	t_ingredient_batch,
	t_ingridient_entry,
	t_supplier,
	tr_ingredient_batch_ingredient_batch,
	tr_supplier_ingredient
} from '$lib/server/db/schema';
import { __DELETE_ALL_DATABASE } from '../utils';
import { sq_stock } from '$logic/_ingredient-stock';
import { eq } from 'drizzle-orm';
import { getFirst } from '$lib/utils';
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

const LIVER_BATCH_INTIAL_AMOUNT = 100 as const;
const SECOND_LIVER_BATCH_INITIAL_AMOUNT = 200 as const;

beforeAll(async () => {
	await __DELETE_ALL_DATABASE();
	await db.insert(t_document_type).values(INVOICE_TYPE);

	LIVER_ID = await ingredient_defaulter_service.add_simple();
	BANANA_ID = await ingredient_defaulter_service.add_simple();
	REDUCED_LIVER_ID = await ingredient_defaulter_service.add_derived({ from: LIVER_ID, amount: 2 });

	SUPPLIER_ID = await suppliers_defaulter_service.add({ ingredientsIds: [LIVER_ID, BANANA_ID] });
});
beforeEach(async () => {
	await db.delete(tr_ingredient_batch_ingredient_batch);
	await db.delete(t_ingredient_batch);
	await db.delete(t_entry_document);

	await db.delete(t_ingridient_entry);
	LIVER_BATCH_ID = await purchases_service
		.registerBoughtIngrediets({
			withdrawal_tax_amount: 10,
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
					batch_code: 'SOME CODE',
					initial_amount: LIVER_BATCH_INTIAL_AMOUNT,
					number_of_bags: 10,
					cost: 1000,
					production_date: new Date(),
					expiration_date: new Date()
				}
			]
		})
		.then((x) => x.batchesId[0]);

	SECOND_LIVER_BATCH_ID = await purchases_service
		.registerBoughtIngrediets({
			withdrawal_tax_amount: 10,
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
					batch_code: 'SOME OTHER CODE',
					initial_amount: SECOND_LIVER_BATCH_INITIAL_AMOUNT,
					number_of_bags: 12,
					cost: 1000,
					production_date: new Date(),
					expiration_date: new Date()
				}
			]
		})
		.then((x) => x.batchesId[0]);

	BANANA_BATCH_ID = await purchases_service
		.registerBoughtIngrediets({
			withdrawal_tax_amount: 10,
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
					ingredient_id: BANANA_ID,
					batch_code: 'SOME OTHER CODE FOR BANANA',
					initial_amount: 20,
					number_of_bags: 1,
					cost: 1000,
					production_date: new Date(),
					expiration_date: new Date()
				}
			]
		})
		.then((x) => x.batchesId[0]);

});

describe.sequential('ingredient produciton start', () => {
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
		expect(batches.length).toBe(3);
	});

	test('if produced_amount=0 return logic error', async () => {
		const res = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 0 },
			[LIVER_BATCH_ID]
		);
		expect(res?.type).toBe('LOGIC_ERROR');
		const batches = await db.select().from(t_ingredient_batch);
		expect(batches.length).toBe(3);
	});

	test('if produced_amount=-10 return logic error', async () => {
		const res = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: -10 },
			[LIVER_BATCH_ID]
		);
		expect(res?.type).toBe('LOGIC_ERROR');
	});

	test('if it is not derived return logic error', async () => {
		const res = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: LIVER_ID, produced_amount: 10 },
			[LIVER_BATCH_ID]
		);
		expect(res?.type).toBe('LOGIC_ERROR');
	});

	test('if batch does not exist return logic error', async () => {
		const res = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 10 },
			[LIVER_BATCH_ID * 1000]
		);
		expect(res.type).toBe('LOGIC_ERROR');
	});

	test('if batch does not exist return logic error', async () => {
		const res = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 10 },
			[LIVER_BATCH_ID, SECOND_LIVER_BATCH_ID * 100]
		);
		expect(res?.type).toBe('LOGIC_ERROR');
	});

	test('if two batches are the same return logic error', async () => {
		const res = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 10 },
			[LIVER_BATCH_ID, LIVER_BATCH_ID]
		);
		expect(res?.type).toBe('LOGIC_ERROR');
	});

	test('if first batch is not of the correct ingredient', async () => {
		const res = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 10 },
			[BANANA_BATCH_ID]
		);
		expect(res?.type).toBe('LOGIC_ERROR');
	});

	test('if second batch is not of the correct ingredient', async () => {
		const res = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 10 },
			[LIVER_BATCH_ID, BANANA_BATCH_ID]
		);
		expect(res?.type).toBe('LOGIC_ERROR');
	});

	test('execedes avaliable source with one batch return logical error', async () => {
		const res = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 1000 },
			[LIVER_BATCH_ID]
		);
		expect(res?.type).toBe('LOGIC_ERROR');
	});

	test('execedes avaliable source with two batches return logical error', async () => {
		const res = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 1000000 },
			[LIVER_BATCH_ID, SECOND_LIVER_BATCH_ID]
		);
		expect(res?.type).toBe('LOGIC_ERROR');
	});

	test('changes value of to_be_used_amount one batch whith to_be_used_amount=20', async () => {
		await db.insert(tr_ingredient_batch_ingredient_batch).values({
			produced_batch_id: LIVER_BATCH_ID,
			used_batch_id: LIVER_BATCH_ID,
			amount_used_to_produce_batch: 15 // 15+5 =20
		});

		await db.insert(tr_ingredient_batch_ingredient_batch).values({
			produced_batch_id: BANANA_BATCH_ID,
			used_batch_id: LIVER_BATCH_ID,
			amount_used_to_produce_batch: 5 //15+5 =20
		});

		const inserted = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 10 },
			[LIVER_BATCH_ID]
		);
		const stock_first = await db
			.with(sq_stock)
			.select()
			.from(sq_stock)
			.where(eq(sq_stock.batch_id, LIVER_BATCH_ID))
			.then(getFirst)
			.then((x) => x.currently_available);

		const to_be_used_first_batch = 10 * 2;
		expect(stock_first).toBe(LIVER_BATCH_INTIAL_AMOUNT - to_be_used_first_batch - 20);

		const r_batches = await db.select().from(tr_ingredient_batch_ingredient_batch);
		expect(r_batches.length).toBe(3);
		expect(r_batches[2].used_batch_id).toBe(LIVER_BATCH_ID);
		expect(r_batches[2].amount_used_to_produce_batch).toBe(2 * 10);
		//@ts-expect-error PENDING: explain
		expect(r_batches[2].produced_batch_id).toBe(inserted.id);
	});

	test('changes value of to_be_used_amount both batches whith to_be_used_amount=0', async () => {
		const res = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 110 },
			[LIVER_BATCH_ID, SECOND_LIVER_BATCH_ID]
		);
		expect(res.type).toBe('SUCCESS');

		const stock_first = await db
			.with(sq_stock)
			.select()
			.from(sq_stock)
			.where(eq(sq_stock.batch_id, LIVER_BATCH_ID))
			.then(getFirst)
			.then((x) => x.currently_available);

		expect(stock_first).toBe(0); // uses all

		const stock_second = await db
			.with(sq_stock)
			.select()
			.from(sq_stock)
			.where(eq(sq_stock.batch_id, SECOND_LIVER_BATCH_ID))
			.then(getFirst)
			.then((x) => x.currently_available);
		expect(stock_second).toBe(SECOND_LIVER_BATCH_INITIAL_AMOUNT - 120);

		const r_batches = await db.select().from(tr_ingredient_batch_ingredient_batch);
		expect(r_batches.length).toBe(2);
		expect(r_batches[0].used_batch_id).toBe(LIVER_BATCH_ID);
		//@ts-expect-error PENDING: explain
		expect(r_batches[0].produced_batch_id).toBe(res.id);
		expect(r_batches[0].amount_used_to_produce_batch).toBe(LIVER_BATCH_INTIAL_AMOUNT);

		expect(r_batches[1].used_batch_id).toBe(SECOND_LIVER_BATCH_ID);
		//@ts-expect-error PENDING: explain
		expect(r_batches[1].produced_batch_id).toBe(res.id);
		expect(r_batches[1].amount_used_to_produce_batch).toBe(110 * 2 - LIVER_BATCH_INTIAL_AMOUNT);
	});

	test('changes value of to_be_used_amount both batches with to_be_used_amount=40 in first and =0 in second', async () => {
		await db.insert(tr_ingredient_batch_ingredient_batch).values({
			used_batch_id: LIVER_BATCH_ID,
			produced_batch_id: LIVER_BATCH_ID, //using this id is inconsiten, but works
			amount_used_to_produce_batch: 40
		});
		const res = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 110 },
			[LIVER_BATCH_ID, SECOND_LIVER_BATCH_ID]
		);

		expect(res.type).toBe('SUCCESS');
		const liver_batch_stock = await db
			.with(sq_stock)
			.select()
			.from(sq_stock)
			.where(eq(sq_stock.batch_id, LIVER_BATCH_ID))
			.then(getFirst);

		expect(liver_batch_stock.currently_available).toBe(0); // uses all

		const second_liver_batch_stock = await db
			.with(sq_stock)
			.select()
			.from(sq_stock)
			.where(eq(sq_stock.batch_id, SECOND_LIVER_BATCH_ID))
			.then(getFirst)
			.then((x) => x.currently_available);

		const expected_use = 2 * 110 - LIVER_BATCH_INTIAL_AMOUNT + 40; //160
		expect(second_liver_batch_stock).toEqual(SECOND_LIVER_BATCH_INITIAL_AMOUNT - expected_use); // 40

		const r_batches = await db.select().from(tr_ingredient_batch_ingredient_batch);
		expect(r_batches.length).toBe(3);
		expect(r_batches[1].used_batch_id).toBe(LIVER_BATCH_ID);
		expect(r_batches[1].amount_used_to_produce_batch).toBe(LIVER_BATCH_INTIAL_AMOUNT - 40);
		//@ts-expect-error PENDING: explain
		expect(r_batches[1].produced_batch_id).toBe(res.id);
		expect(r_batches[2].used_batch_id).toBe(SECOND_LIVER_BATCH_ID);
		//@ts-expect-error PENDING: explain
		expect(r_batches[2].produced_batch_id).toBe(res.id);
		expect(r_batches[2].amount_used_to_produce_batch).toBe(
			2 * 110 - LIVER_BATCH_INTIAL_AMOUNT + 40
		);
	});

	test('should add a ingredient batch', async () => {
		const date = new Date(2000, 1, 1, 13);
		vi.setSystemTime(date);
		const res = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 110 },
			[LIVER_BATCH_ID, SECOND_LIVER_BATCH_ID]
		);
		//@ts-expect-error PENDING: explain
		const { id, type } = res;
		expect(type).toBe('SUCCESS');
		expect(id).toBeTruthy();
		const inserted = await db
			.select()
			.from(t_ingredient_batch)
			.where(eq(id, t_ingredient_batch.id))
			.then(getFirst);
		expect(inserted).toBeTruthy();
		expect(inserted.id).toBe(id);
		expect(inserted.batch_code).toBeTruthy();
		expect(inserted.initial_amount).toBe(110);
		expect(inserted.production_date).toEqual(null);
		expect(inserted.expiration_date).toEqual(null);
		expect(inserted.ingredient_id).toBe(REDUCED_LIVER_ID);
		expect(inserted.number_of_bags).toBe(1);
		expect(inserted.state).toBe('IN_PRODUCTION');
		expect(inserted.supplier_id).toBe(null);
		expect(inserted.cost).toBe(null);
		expect(inserted.currency_alpha_code).toBe('ARG');
		expect(inserted.adjustment).toBe(null);

		const r_batches = await db.select().from(tr_ingredient_batch_ingredient_batch);
		expect(r_batches.length).toBe(2);
		expect(r_batches[0].used_batch_id).toBe(LIVER_BATCH_ID);
		//@ts-expect-error PENDING: explain
		expect(r_batches[0].produced_batch_id).toBe(res.id);
		expect(r_batches[0].amount_used_to_produce_batch).toBe(LIVER_BATCH_INTIAL_AMOUNT);
		expect(r_batches[1].used_batch_id).toBe(SECOND_LIVER_BATCH_ID);
		//@ts-expect-error PENDING: explain
		expect(r_batches[1].produced_batch_id).toBe(res.id);
		expect(r_batches[1].amount_used_to_produce_batch).toBe(2 * 110 - LIVER_BATCH_INTIAL_AMOUNT);
	});
});
