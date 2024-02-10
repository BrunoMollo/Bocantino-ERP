import { describe, test, expect, vi, beforeAll, beforeEach } from 'vitest';
import { __DELETE_ALL_DATABASE } from './utils';
import { INVOICE_TYPE, db } from '$lib/server/db/__mocks__';
import {
	t_document_type,
	t_entry_document,
	t_ingredient_batch,
	t_ingridient_entry,
	t_product_batch,
	tr_ingredient_batch_ingredient_batch,
	tr_product_batch_ingredient_batch
} from '$lib/server/db/schema';
import { ingredients_service } from '$logic/ingredient-service';
import { suppliers_service } from '$logic/suppliers-service';
import { product_service } from '$logic/product-service';
import { purchases_service } from '$logic/ingredient-purchase-service';
import { sq_stock } from '$logic/_ingredient-stock';
import { by } from '$lib/utils';
import { ingredient_production_service } from '$logic/ingredient-production-service';

vi.mock('$lib/server/db/index.ts');

let LIVER_ID = -1;
let REDUCED_LIVER_ID = -1;
let FOOD_DOG_ID = -1;
let SUPPLIER_ID = -1;

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

	REDUCED_LIVER_ID = await ingredients_service
		.add(
			{
				name: 'Reduced Liver',
				unit: 'Kg',
				reorder_point: 120
			},
			{ id: LIVER_ID, amount: 2 }
		)
		.then((x) => x.id);

	SUPPLIER_ID = await suppliers_service
		.add({
			name: 'Juan',
			email: 'jj@gmail.com',
			ingredientsIds: [LIVER_ID, REDUCED_LIVER_ID]
		})
		.then((x) => x.id);

	FOOD_DOG_ID = await product_service
		.add({
			desc: 'Dog food',
			ingredients: [{ ingredient_id: LIVER_ID, amount: 10 }]
		})
		.then((x) => x.id);
});

beforeEach(async () => {
	await db.delete(tr_product_batch_ingredient_batch);
	await db.delete(t_product_batch);
	await db.delete(tr_ingredient_batch_ingredient_batch);
	await db.delete(t_ingredient_batch);
	await db.delete(t_ingridient_entry);
	await db.delete(t_entry_document);
});

describe.sequential('stock ingredients', () => {
	test('empty array when there are not batches', async () => {
		const res = await db.with(sq_stock).select().from(sq_stock);
		expect(res).toEqual([]);
	});
	test('after buying two ingredients batches, stock increase', async () => {
		const [first_batch_id, second_batch_id] = await purchases_service
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
						ingredient_id: REDUCED_LIVER_ID,
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

		const res = await db.with(sq_stock).select().from(sq_stock);
		expect(res.toSorted(by('batch_id'))).toEqual([
			{ batch_id: first_batch_id, currently_available: 20_000 },
			{ batch_id: second_batch_id, currently_available: 10_000 }
		]);
	});

	test('when start producing product,substract stock', async () => {
		const [first_batch_id] = await purchases_service
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
						initial_amount: 2_000,
						number_of_bags: 1,
						cost: 1000,
						production_date: new Date(),
						expiration_date: new Date()
					}
				]
			})
			.then((x) => x.batchesId);
		{
			const res = await product_service.startProduction({
				product_id: FOOD_DOG_ID,
				recipe: [{ ingredient_id: LIVER_ID, amount: 100 }],
				produced_amount: 2,
				batches_ids: [[first_batch_id]]
			});
			expect(res.type).toBe('SUCCESS');
		}
		{
			const res = await product_service.startProduction({
				product_id: FOOD_DOG_ID,
				recipe: [{ ingredient_id: LIVER_ID, amount: 50 }],
				produced_amount: 2,
				batches_ids: [[first_batch_id]]
			});
			expect(res.type).toBe('SUCCESS');
		}

		const res = await db.with(sq_stock).select().from(sq_stock);
		expect(res.length).toBe(1);
		expect(res).toEqual([{ batch_id: first_batch_id, currently_available: 1_700 }]);
	});

	test('when close product production, mantain substracted stock and djunstent does not affect (+10)', async () => {
		const [first_batch_id] = await purchases_service
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
						initial_amount: 2_000,
						number_of_bags: 1,
						cost: 1000,
						production_date: new Date(),
						expiration_date: new Date()
					}
				]
			})
			.then((x) => x.batchesId);
		{
			const res = await product_service.startProduction({
				product_id: FOOD_DOG_ID,
				recipe: [{ ingredient_id: LIVER_ID, amount: 100 }],
				produced_amount: 2,
				batches_ids: [[first_batch_id]]
			});
			expect(res.type).toBe('SUCCESS');
		}
		{
			const res = await product_service.startProduction({
				product_id: FOOD_DOG_ID,
				recipe: [{ ingredient_id: LIVER_ID, amount: 50 }],
				produced_amount: 2,
				batches_ids: [[first_batch_id]]
			});
			expect(res.type).toBe('SUCCESS');
			if (res.type == 'SUCCESS') {
				await product_service.closeProduction({ batch_id: res.data.id, adjustment: 10 });
			}
		}

		const res = await db.with(sq_stock).select().from(sq_stock);
		expect(res.length).toBe(1);
		expect(res).toEqual([{ batch_id: first_batch_id, currently_available: 1_700 }]);
	});

	test('when cancel produciton of product, stoke is resotred', async () => {
		const [first_batch_id] = await purchases_service
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
						initial_amount: 2_000,
						number_of_bags: 1,
						cost: 1000,
						production_date: new Date(),
						expiration_date: new Date()
					}
				]
			})
			.then((x) => x.batchesId);
		{
			const res = await product_service.startProduction({
				product_id: FOOD_DOG_ID,
				recipe: [{ ingredient_id: LIVER_ID, amount: 50 }],
				produced_amount: 2,
				batches_ids: [[first_batch_id]]
			});
			expect(res.type).toBe('SUCCESS');
			if (res.type == 'SUCCESS') {
				await product_service.deleteBatchById(res.data.id);
			}
		}

		const res = await db.with(sq_stock).select().from(sq_stock);
		expect(res).toEqual([{ batch_id: first_batch_id, currently_available: 2_000 }]);
	});

	test('while producing ingredient, stock is reduced used & produced batch does not appear', async () => {
		const [first_batch_id] = await purchases_service
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
						initial_amount: 2_000,
						number_of_bags: 1,
						cost: 1000,
						production_date: new Date(),
						expiration_date: new Date()
					}
				]
			})
			.then((x) => x.batchesId);
		await ingredient_production_service
			.startIngredientProduction({ ingedient_id: REDUCED_LIVER_ID, produced_amount: 100 }, [
				first_batch_id
			])
			.then((x) => expect(x.type).toBe('SUCCESS'));

		const res = await db.with(sq_stock).select().from(sq_stock);
		expect(res.sort(by('batch_id'))).toEqual([
			{ batch_id: first_batch_id, currently_available: 1_800 }
		]);
	});

	test('after producing ingredient, stock is reduced used & produced batch appear (adjusntment=0)', async () => {
		const [first_batch_id] = await purchases_service
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
						initial_amount: 2_000,
						number_of_bags: 1,
						cost: 1000,
						production_date: new Date(),
						expiration_date: new Date()
					}
				]
			})
			.then((x) => x.batchesId);
		const producrd_id = await ingredient_production_service
			.startIngredientProduction({ ingedient_id: REDUCED_LIVER_ID, produced_amount: 100 }, [
				first_batch_id
			])
			.then((x) => {
				expect(x.type).toBe('SUCCESS');
				return x.type == 'SUCCESS' ? x.id : -1;
			});

		await ingredient_production_service.closeProduction({ batch_id: producrd_id, adjustment: 0 });

		const res = await db.with(sq_stock).select().from(sq_stock);
		expect(res.sort(by('batch_id'))).toEqual([
			{ batch_id: first_batch_id, currently_available: 1_800 },
			{ batch_id: producrd_id, currently_available: 100 }
		]);
	});

	test('after producing ingredient, stock is reduced used & produced batch appear (adjusntment=+10)', async () => {
		const [first_batch_id] = await purchases_service
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
						initial_amount: 2_000,
						number_of_bags: 1,
						cost: 1000,
						production_date: new Date(),
						expiration_date: new Date()
					}
				]
			})
			.then((x) => x.batchesId);
		const producrd_id = await ingredient_production_service
			.startIngredientProduction({ ingedient_id: REDUCED_LIVER_ID, produced_amount: 100 }, [
				first_batch_id
			])
			.then((x) => {
				expect(x.type).toBe('SUCCESS');
				return x.type == 'SUCCESS' ? x.id : -1;
			});

		await ingredient_production_service.closeProduction({ batch_id: producrd_id, adjustment: 10 });

		const res = await db.with(sq_stock).select().from(sq_stock);
		expect(res.sort(by('batch_id'))).toEqual([
			{ batch_id: first_batch_id, currently_available: 1_800 },
			{ batch_id: producrd_id, currently_available: 110 }
		]);
	});

	test('after producing ingredient, stock is reduced used & produced batch appear (adjusntment=-15)', async () => {
		const [first_batch_id] = await purchases_service
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
						initial_amount: 2_000,
						number_of_bags: 1,
						cost: 1000,
						production_date: new Date(),
						expiration_date: new Date()
					}
				]
			})
			.then((x) => x.batchesId);
		const producrd_id = await ingredient_production_service
			.startIngredientProduction({ ingedient_id: REDUCED_LIVER_ID, produced_amount: 100 }, [
				first_batch_id
			])
			.then((x) => {
				expect(x.type).toBe('SUCCESS');
				return x.type == 'SUCCESS' ? x.id : -1;
			});

		await ingredient_production_service.closeProduction({ batch_id: producrd_id, adjustment: -15 });

		const res = await db.with(sq_stock).select().from(sq_stock);
		expect(res.sort(by('batch_id'))).toEqual([
			{ batch_id: first_batch_id, currently_available: 1_800 },
			{ batch_id: producrd_id, currently_available: 85 }
		]);
	});

	test('cancel producing ingredient, stock is restored used & produced batch does not appear', async () => {
		const [first_batch_id] = await purchases_service
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
						initial_amount: 2_000,
						number_of_bags: 1,
						cost: 1000,
						production_date: new Date(),
						expiration_date: new Date()
					}
				]
			})
			.then((x) => x.batchesId);
		const producrd_id = await ingredient_production_service
			.startIngredientProduction({ ingedient_id: REDUCED_LIVER_ID, produced_amount: 100 }, [
				first_batch_id
			])
			.then((x) => {
				expect(x.type).toBe('SUCCESS');
				return x.type == 'SUCCESS' ? x.id : -1;
			});

		await ingredient_production_service.deleteBatchById(producrd_id);

		const res = await db.with(sq_stock).select().from(sq_stock);
		expect(res.sort(by('batch_id'))).toEqual([
			{ batch_id: first_batch_id, currently_available: 2_000 }
		]);
	});

	test('a lot of stuff', async () => {
		const [first_batch_id] = await purchases_service
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
						initial_amount: 2_000,
						number_of_bags: 1,
						cost: 1000,
						production_date: new Date(),
						expiration_date: new Date()
					}
				]
			})
			.then((x) => x.batchesId);
		{
			//product product -250
			const res = await product_service.startProduction({
				product_id: FOOD_DOG_ID,
				recipe: [{ ingredient_id: LIVER_ID, amount: 2.5 }],
				produced_amount: 100,
				batches_ids: [[first_batch_id]]
			});
			expect(res.type).toBe('SUCCESS');
		}

		{
			//product product and cancel 0
			const res = await product_service.startProduction({
				product_id: FOOD_DOG_ID,
				recipe: [{ ingredient_id: LIVER_ID, amount: 100 }],
				produced_amount: 2,
				batches_ids: [[first_batch_id]]
			});
			if (res.type == 'SUCCESS') {
				const res2 = await product_service.deleteBatchById(res.data.id);
				expect(res2.type).toBe('SUCCESS');
			}
		}
		{
			// start ingredient production -200
			const res = await ingredient_production_service.startIngredientProduction(
				{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 100 },
				[first_batch_id]
			);
			expect(res.type).toBe('SUCCESS');
		}

		{
			// start ingredient production and cancel -0
			const res = await ingredient_production_service.startIngredientProduction(
				{ ingedient_id: REDUCED_LIVER_ID, produced_amount: 100 },
				[first_batch_id]
			);
			if (res.type == 'SUCCESS') {
				const res2 = await ingredient_production_service.deleteBatchById(res.id);
				expect(res2.type).toBe('SUCCESS');
			}
		}

		const res = await db.with(sq_stock).select().from(sq_stock);
		expect(res.length).toBe(1);
		expect(res).toEqual([{ batch_id: first_batch_id, currently_available: 1_550 }]);
	});
});

