import { describe, expect, vi, test, beforeEach, beforeAll, afterEach } from 'vitest';
import { INVOICE_TYPE, db } from '$lib/server/db/__mocks__';
import {
	t_document_type,
	t_entry_document,
	t_ingredient,
	t_ingredient_batch,
	t_ingridient_entry,
	t_product,
	t_supplier,
	tr_ingredient_batch_ingredient_batch,
	tr_ingredient_ingredient,
	tr_ingredient_product,
	tr_supplier_ingredient
} from '$lib/server/db/schema';
import { ingredients_service, suppliers_service, purchases_service } from '$logic';
import { product_service } from '$logic/product-logic';
import { BADSTR } from 'dns';
import { __DELETE_ALL_DATABASE } from './utils';

vi.mock('$lib/server/db/index.ts');

describe.sequential('start production of derived ingredient', async () => {
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
		vi.useFakeTimers();
		await db.delete(tr_ingredient_batch_ingredient_batch);
		await db.delete(t_ingredient_batch);
		await db.delete(t_ingridient_entry);
		await db.delete(t_entry_document);

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
	afterEach(() => {
		vi.useRealTimers();
	});

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
});

