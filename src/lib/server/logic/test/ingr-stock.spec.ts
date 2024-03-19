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
import { product_service } from '$logic/product-service';
import { sq_stock } from '$logic/_ingredient-stock';
import { by } from '$lib/utils';
import { ingredient_production_service } from '$logic/ingredient-production-service';
import { ingredient_defaulter_service } from '$logic/defaulters/ingredient-service.default';
import { suppliers_defaulter_service } from '$logic/defaulters/supplier-service.default';
import { purchases_defaulter_service } from '$logic/defaulters/purchase-service.default';

vi.mock('$lib/server/db/index.ts');

let LIVER_ID = -1;
let REDUCED_LIVER_ID = -1;
let FOOD_DOG_ID = -1;
let SUPPLIER_ID = -1;

beforeAll(async () => {
	await __DELETE_ALL_DATABASE();
	await db.insert(t_document_type).values(INVOICE_TYPE);

	LIVER_ID = await ingredient_defaulter_service.add_simple();
	REDUCED_LIVER_ID = await ingredient_defaulter_service.add_derived({ from: LIVER_ID, amount: 2 });

	SUPPLIER_ID = await suppliers_defaulter_service.add({
		ingredientsIds: [LIVER_ID, REDUCED_LIVER_ID]
	});

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
		const [first_batch_id, second_batch_id] = await purchases_defaulter_service.buy({
			supplier_id: SUPPLIER_ID,
			bought: [
				{ ingredient_id: LIVER_ID, initial_amount: 20_000 },
				{ ingredient_id: REDUCED_LIVER_ID, initial_amount: 10_000 }
			]
		});

		const res = await db.with(sq_stock).select().from(sq_stock);
		expect(res.toSorted(by('batch_id'))).toEqual([
			{ batch_id: first_batch_id, currently_available: 20_000 },
			{ batch_id: second_batch_id, currently_available: 10_000 }
		]);
	});

	test('when start producing product,substract stock', async () => {
		const [first_batch_id] = await purchases_defaulter_service.buy({
			supplier_id: SUPPLIER_ID,
			bought: [{ ingredient_id: LIVER_ID, initial_amount: 2_000 }]
		});
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
		const [first_batch_id] = await purchases_defaulter_service.buy({
			supplier_id: SUPPLIER_ID,
			bought: [{ ingredient_id: LIVER_ID, initial_amount: 2_000 }]
		});
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
		const [first_batch_id] = await purchases_defaulter_service.buy({
			supplier_id: SUPPLIER_ID,
			bought: [{ ingredient_id: LIVER_ID, initial_amount: 2_000 }]
		});
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
		const [first_batch_id] = await purchases_defaulter_service.buy({
			supplier_id: SUPPLIER_ID,
			bought: [{ ingredient_id: LIVER_ID, initial_amount: 2_000 }]
		});
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
		const [first_batch_id] = await purchases_defaulter_service.buy({
			supplier_id: SUPPLIER_ID,
			bought: [{ ingredient_id: LIVER_ID, initial_amount: 2_000 }]
		});
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
		const [first_batch_id] = await purchases_defaulter_service.buy({
			supplier_id: SUPPLIER_ID,
			bought: [{ ingredient_id: LIVER_ID, initial_amount: 2_000 }]
		});
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
		const [first_batch_id] = await purchases_defaulter_service.buy({
			supplier_id: SUPPLIER_ID,
			bought: [{ ingredient_id: LIVER_ID, initial_amount: 2_000 }]
		});
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
		const [first_batch_id] = await purchases_defaulter_service.buy({
			supplier_id: SUPPLIER_ID,
			bought: [{ ingredient_id: LIVER_ID, initial_amount: 2_000 }]
		});
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
		const [first_batch_id] = await purchases_defaulter_service.buy({
			supplier_id: SUPPLIER_ID,
			bought: [{ ingredient_id: LIVER_ID, initial_amount: 2_000 }]
		});
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
