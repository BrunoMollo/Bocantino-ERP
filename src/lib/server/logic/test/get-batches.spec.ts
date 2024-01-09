import { describe, expect, vi, test, beforeAll } from 'vitest';
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

vi.mock('$lib/server/db/index.ts');

describe.sequential('start production of derived ingredient', async () => {
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

		const batch = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 10 },
			[LIVER_BATCH_ID]
		);
		//@ts-ignore
		BATCH_IN_PROD_ID = batch.id;

		const finsihced_batch = await ingredient_production_service.startIngredientProduction(
			{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 10 },
			[LIVER_BATCH_ID]
		);

		//@ts-ignore
		await ingredient_production_service.closeProduction({ batch_id: finsihced_batch.id, loss: 2 });
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
		expect(batches.length).toBe(5);
	});
	test('get liver', async () => {
		const exp = await ingredient_production_service.getBatchById_deprecated(LIVER_BATCH_ID);
		const res = await ingredient_production_service.getBatchById(LIVER_BATCH_ID);
		expect(res?.current_amount).toEqual(exp?.current_amount);
	});

	test('get second liver', async () => {
		const exp = await ingredient_production_service.getBatchById_deprecated(SECOND_LIVER_BATCH_ID);
		const res = await ingredient_production_service.getBatchById(SECOND_LIVER_BATCH_ID);
		expect(res?.current_amount).toEqual(exp?.current_amount);
	});

	test('get in prod bacth', async () => {
		const res = await ingredient_production_service.getBatchById(BATCH_IN_PROD_ID);
		expect(res?.current_amount).toEqual(null);
	});

	test('get Banana', async () => {
		const exp = await ingredient_production_service.getBatchById_deprecated(BANANA_BATCH_ID);
		const res = await ingredient_production_service.getBatchById(BANANA_BATCH_ID);
		expect(res?.current_amount).toEqual(exp?.current_amount);
	});
});

