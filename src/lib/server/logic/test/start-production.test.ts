import { describe, expect, vi, test, beforeEach, beforeAll, afterEach } from 'vitest';
import { INVOICE_TYPE, db } from '$lib/server/db/__mocks__';
import {
	t_document_type,
	t_entry_document,
	t_ingredient,
	t_ingredient_batch,
	t_ingridient_entry,
	t_supplier,
	tr_ingredient_batch_ingredient_batch,
	tr_ingredient_ingredient,
	tr_supplier_ingredient
} from '$lib/server/db/schema';
import {
	ingredients_service,
	suppliers_service,
	ingredient_production_service,
	purchases_service
} from '$logic';
import { eq } from 'drizzle-orm';
import { getFirst } from '$lib/utils';

vi.mock('$lib/server/db/index.ts');

describe.sequential('start production of derived ingredient', async () => {
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
		await db.delete(tr_ingredient_batch_ingredient_batch);
		await db.delete(tr_ingredient_ingredient);
		await db.delete(t_ingredient_batch);
		await db.delete(tr_supplier_ingredient);
		await db.delete(t_ingridient_entry);
		await db.delete(t_supplier);
		await db.delete(t_ingredient);
		await db.delete(t_entry_document);
		await db.delete(t_document_type);
		await db.insert(t_document_type).values(INVOICE_TYPE);

		LIVER_ID = await ingredients_service
			.add({
				name: 'Liver',
				unit: 'Kilogramos',
				reorderPoint: 100
			})
			.then((x) => x.id);

		BANANA_ID = await ingredients_service
			.add({
				name: 'Banana',
				unit: 'Kilogramos',
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
					unit: 'Kilogramos',
					reorderPoint: 80
				},
				{
					id: LIVER_ID,
					amount: 2
				}
			)
			.then((x) => x.id);
	});

	beforeEach(async () => {
		vi.useFakeTimers();
		await db.delete(tr_ingredient_batch_ingredient_batch);
		await db.delete(t_ingredient_batch);
		await db.delete(t_ingridient_entry);
		await db.delete(t_entry_document);

		LIVER_BATCH_ID = await purchases_service
			.registerBoughtIngrediets({
				supplierId: SUPPLIER_ID,
				document: { number: '1234', typeId: INVOICE_TYPE.id, issue_date: new Date() },
				batches: [
					{
						ingredientId: LIVER_ID,
						batch_code: 'SOME CODE',
						initialAmount: LIVER_BATCH_INTIAL_AMOUNT,
						numberOfBags: 10,
						cost: 1000,
						productionDate: new Date(),
						expirationDate: new Date()
					}
				]
			})
			.then((x) => x.batchesId[0]);

		SECOND_LIVER_BATCH_ID = await purchases_service
			.registerBoughtIngrediets({
				supplierId: SUPPLIER_ID,
				document: { number: '1234', typeId: INVOICE_TYPE.id, issue_date: new Date() },
				batches: [
					{
						ingredientId: LIVER_ID,
						batch_code: 'SOME OTHER CODE',
						initialAmount: SECOND_LIVER_BATCH_INITIAL_AMOUNT,
						numberOfBags: 12,
						cost: 1000,
						productionDate: new Date(),
						expirationDate: new Date()
					}
				]
			})
			.then((x) => x.batchesId[0]);

		BANANA_BATCH_ID = await purchases_service
			.registerBoughtIngrediets({
				supplierId: SUPPLIER_ID,
				document: { number: '1234', typeId: INVOICE_TYPE.id, issue_date: new Date() },
				batches: [
					{
						ingredientId: BANANA_ID,
						batch_code: 'SOME OTHER CODE FOR BANANA',
						initialAmount: 20,
						numberOfBags: 1,
						cost: 1000,
						productionDate: new Date(),
						expirationDate: new Date()
					}
				]
			})
			.then((x) => x.batchesId[0]);
	});
	afterEach(() => {
		vi.useRealTimers();
	});

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
		expect(rel_sup_ingred[0].supplierId).toBe(SUPPLIER_ID);
		expect(rel_sup_ingred[0].ingredientId).toBe(LIVER_ID);

		const batches = await db.select().from(t_ingredient_batch);
		expect(batches.length).toBe(3);
	});

	test('if produced_amount=0 return logic error', async () => {
		const res = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 0 },
			[LIVER_BATCH_ID]
		);
		//@ts-ignore
		expect(res?.type).toBe('LOGIC_ERROR');
		const batches = await db.select().from(t_ingredient_batch);
		expect(batches.length).toBe(3);
	});

	test('if produced_amount=-10 return logic error', async () => {
		const res = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: -10 },
			[LIVER_BATCH_ID]
		);
		//@ts-ignore
		expect(res?.type).toBe('LOGIC_ERROR');
	});

	test('if it is not derived return logic error', async () => {
		const res = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: LIVER_ID, produced_amount: 10 },
			[LIVER_BATCH_ID]
		);
		//@ts-ignore
		expect(res?.type).toBe('LOGIC_ERROR');
	});

	test('if batch does not exist return logic error', async () => {
		const res = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 10 },
			[LIVER_BATCH_ID * 100]
		);
		//@ts-ignore
		expect(res?.type).toBe('LOGIC_ERROR');
	});

	test('if batch does not exist return logic error', async () => {
		const res = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 10 },
			[LIVER_BATCH_ID, SECOND_LIVER_BATCH_ID * 100]
		);
		//@ts-ignore
		expect(res?.type).toBe('LOGIC_ERROR');
	});

	test('if two batches are the same return logic error', async () => {
		const res = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 10 },
			[LIVER_BATCH_ID, LIVER_BATCH_ID]
		);
		//@ts-ignore
		expect(res?.type).toBe('LOGIC_ERROR');
	});

	test('if first batch is not of the correct ingredient', async () => {
		const res = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 10 },
			[BANANA_BATCH_ID]
		);
		//@ts-ignore
		expect(res?.type).toBe('LOGIC_ERROR');
	});

	test('if second batch is not of the correct ingredient', async () => {
		const res = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 10 },
			[LIVER_BATCH_ID, BANANA_BATCH_ID]
		);
		//@ts-ignore
		expect(res?.type).toBe('LOGIC_ERROR');
	});

	test('execedes avaliable source with one batch return logical error', async () => {
		const res = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 1000 },
			[LIVER_BATCH_ID]
		);
		//@ts-ignore
		expect(res?.type).toBe('LOGIC_ERROR');
	});

	test('execedes avaliable source with two batches return logical error', async () => {
		const res = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 1000000 },
			[LIVER_BATCH_ID, SECOND_LIVER_BATCH_ID]
		);
		//@ts-ignore
		expect(res?.type).toBe('LOGIC_ERROR');
	});

	test('if more batches selected than necesary return logical error', async () => {
		const res = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 50 },
			[LIVER_BATCH_ID, SECOND_LIVER_BATCH_ID]
		);
		//@ts-ignore
		expect(res?.type).toBe('LOGIC_ERROR');
	});

	test('changes value of to_be_used_amount one batch whith to_be_used_amount=0', async () => {
		const old_to_be_used_amount = await db
			.select()
			.from(t_ingredient_batch)
			.where(eq(t_ingredient_batch.id, LIVER_BATCH_ID))
			.then(getFirst)
			.then((x) => x.to_be_used_amount);

		const inserted = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 10 },
			[LIVER_BATCH_ID]
		);
		const to_be_used_fist_batch = await db.query.t_ingredient_batch
			.findFirst({
				where: eq(t_ingredient_batch.id, LIVER_BATCH_ID)
			})
			.then((x) => x?.to_be_used_amount);

		expect(to_be_used_fist_batch).toBe(10 * 2 + old_to_be_used_amount);

		const r_batches = await db.select().from(tr_ingredient_batch_ingredient_batch);
		expect(r_batches.length).toBe(1);
		expect(r_batches[0].used_batch_id).toBe(LIVER_BATCH_ID);
		//@ts-ignore
		expect(r_batches[0].produced_batch_id).toBe(inserted.id);
		expect(r_batches[0].amountUsed).toBe(20);
	});

	test('changes value of to_be_used_amount one batch whith to_be_used_amount=20', async () => {
		const old_to_be_used_amount = 20;
		await db
			.update(t_ingredient_batch)
			.set({ to_be_used_amount: old_to_be_used_amount })
			.where(eq(t_ingredient_batch.id, LIVER_BATCH_ID));

		const inserted = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 10 },
			[LIVER_BATCH_ID]
		);
		const to_be_used_fist_batch = await db.query.t_ingredient_batch
			.findFirst({
				where: eq(t_ingredient_batch.id, LIVER_BATCH_ID)
			})
			.then((x) => x?.to_be_used_amount);

		expect(to_be_used_fist_batch).toBe(10 * 2 + old_to_be_used_amount);

		const r_batches = await db.select().from(tr_ingredient_batch_ingredient_batch);
		expect(r_batches.length).toBe(1);
		expect(r_batches[0].used_batch_id).toBe(LIVER_BATCH_ID);
		expect(r_batches[0].amountUsed).toBe(2 * 10);
		//@ts-ignore
		expect(r_batches[0].produced_batch_id).toBe(inserted.id);
	});

	test('changes value of to_be_used_amount both batches whith to_be_used_amount=0', async () => {
		const res = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 110 },
			[LIVER_BATCH_ID, SECOND_LIVER_BATCH_ID]
		);
		//@ts-ignore
		expect(res.type).toBe(undefined);
		const to_be_used_fist_batch = await db.query.t_ingredient_batch
			.findFirst({
				where: eq(t_ingredient_batch.id, LIVER_BATCH_ID)
			})
			.then((x) => x?.to_be_used_amount);

		expect(to_be_used_fist_batch).toBe(100);

		const to_be_used_second_batch = await db.query.t_ingredient_batch
			.findFirst({
				where: eq(t_ingredient_batch.id, SECOND_LIVER_BATCH_ID)
			})
			.then((x) => x?.to_be_used_amount);
		expect(to_be_used_second_batch).toBe(120);

		const r_batches = await db.select().from(tr_ingredient_batch_ingredient_batch);
		expect(r_batches.length).toBe(2);
		expect(r_batches[0].used_batch_id).toBe(LIVER_BATCH_ID);
		//@ts-ignore
		expect(r_batches[0].produced_batch_id).toBe(res.id);
		expect(r_batches[0].amountUsed).toBe(LIVER_BATCH_INTIAL_AMOUNT);

		expect(r_batches[1].used_batch_id).toBe(SECOND_LIVER_BATCH_ID);
		//@ts-ignore
		expect(r_batches[1].produced_batch_id).toBe(res.id);
		expect(r_batches[1].amountUsed).toBe(110 * 2 - LIVER_BATCH_INTIAL_AMOUNT);
	});

	test('changes value of to_be_used_amount both batches with to_be_used_amount=40 in first and =0 in second', async () => {
		const old_to_be_used_amount = 40;
		await db
			.update(t_ingredient_batch)
			.set({ to_be_used_amount: old_to_be_used_amount })
			.where(eq(t_ingredient_batch.id, LIVER_BATCH_ID));
		const res = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 110 },
			[LIVER_BATCH_ID, SECOND_LIVER_BATCH_ID]
		);
		//@ts-ignore
		expect(res.type).toBe(undefined);
		const to_be_used_fist_batch = await db.query.t_ingredient_batch
			.findFirst({
				where: eq(t_ingredient_batch.id, LIVER_BATCH_ID)
			})
			.then((x) => x?.to_be_used_amount);

		expect(to_be_used_fist_batch).toBe(LIVER_BATCH_INTIAL_AMOUNT); // 100 (all)

		const to_be_used_second_batch = await db.query.t_ingredient_batch
			.findFirst({
				where: eq(t_ingredient_batch.id, SECOND_LIVER_BATCH_ID)
			})
			.then((x) => x?.to_be_used_amount);
		expect(to_be_used_second_batch).toBe(2 * 110 - LIVER_BATCH_INTIAL_AMOUNT + 40); // 160

		const r_batches = await db.select().from(tr_ingredient_batch_ingredient_batch);
		expect(r_batches.length).toBe(2);
		expect(r_batches[0].used_batch_id).toBe(LIVER_BATCH_ID);
		expect(r_batches[0].amountUsed).toBe(LIVER_BATCH_INTIAL_AMOUNT - 40);
		//@ts-ignore
		expect(r_batches[0].produced_batch_id).toBe(res.id);
		expect(r_batches[1].used_batch_id).toBe(SECOND_LIVER_BATCH_ID);
		//@ts-ignore
		expect(r_batches[1].produced_batch_id).toBe(res.id);
		expect(r_batches[1].amountUsed).toBe(2 * 110 - LIVER_BATCH_INTIAL_AMOUNT + 40);
	});

	test('should add a ingredient batch', async () => {
		const date = new Date(2000, 1, 1, 13);
		vi.setSystemTime(date);
		const res = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 110 },
			[LIVER_BATCH_ID, SECOND_LIVER_BATCH_ID]
		);
		//@ts-ignore
		const { id, type } = res;
		expect(type).toBe(undefined);
		expect(id).toBeTruthy();
		const inserted = await db
			.select()
			.from(t_ingredient_batch)
			.where(eq(id, t_ingredient_batch.id))
			.then(getFirst);
		expect(inserted).toBeTruthy();
		expect(inserted.id).toBe(id);
		expect(inserted.batch_code).toBeTruthy();
		expect(inserted.initialAmount).toBe(110);
		expect(inserted.usedAmount).toBe(0);
		expect(inserted.to_be_used_amount).toBe(0);
		expect(inserted.productionDate).toEqual(null);
		expect(inserted.expirationDate).toEqual(date); //TODO: define how is assigned
		expect(inserted.ingredientId).toBe(REDUCED_LIVER_ID);
		expect(inserted.numberOfBags).toBe(1);
		expect(inserted.state).toBe('IN_PRODUCTION');
		expect(inserted.supplierId).toBe(null);
		expect(inserted.cost).toBe(null);
		expect(inserted.currency_alpha_code).toBe('ARG');
		expect(inserted.loss).toBe(null);

		const r_batches = await db.select().from(tr_ingredient_batch_ingredient_batch);
		expect(r_batches.length).toBe(2);
		expect(r_batches[0].used_batch_id).toBe(LIVER_BATCH_ID);
		//@ts-ignore
		expect(r_batches[0].produced_batch_id).toBe(res.id);
		expect(r_batches[0].amountUsed).toBe(LIVER_BATCH_INTIAL_AMOUNT);
		expect(r_batches[1].used_batch_id).toBe(SECOND_LIVER_BATCH_ID);
		//@ts-ignore
		expect(r_batches[1].produced_batch_id).toBe(res.id);
		expect(r_batches[1].amountUsed).toBe(2 * 110 - LIVER_BATCH_INTIAL_AMOUNT);
	});
});

