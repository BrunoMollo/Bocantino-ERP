import { describe, expect, vi, test, beforeEach, beforeAll } from 'vitest';
import { db } from '$lib/server/db/__mocks__';
import { t_entry_document, t_ingredient_batch, t_ingridient_entry } from '$lib/server/db/schema';
import { purchases_service } from '$logic/ingredient-purchase-service';
import { ingredient_defaulter_service } from '$logic/defaulters/ingredient-service.default';
import { suppliers_defaulter_service } from '$logic/defaulters/supplier-service.default';
import { justDate, someDate } from '$logic/defaulters/utils';
import { getFirst, only_unique } from '$lib/utils';

vi.mock('$lib/server/db/index.ts');

let BANANA_ID = -1;
let APPLE_ID = -1;
let FRUIT_SUPPLIER_ID = -1;
beforeAll(async () => {
	BANANA_ID = await ingredient_defaulter_service.add_simple();
	APPLE_ID = await ingredient_defaulter_service.add_simple();
	FRUIT_SUPPLIER_ID = await suppliers_defaulter_service.add({
		ingredientsIds: [BANANA_ID, APPLE_ID]
	});
});
beforeEach(async () => {
	await db.delete(t_ingredient_batch);
	await db.delete(t_entry_document);
	await db.delete(t_ingridient_entry);
});

describe.sequential('buy ingredients with entry note, one batch', async () => {
	test.each([
		{
			initial_amount: 10,
			cost: 200,
			number_of_bags: 1
		},
		{
			initial_amount: 10.4,
			cost: 100.7,
			number_of_bags: 2
		},
		{
			initial_amount: 5000,
			cost: 10_000_00.2,
			number_of_bags: 5
		}
	])(
		'happy path with one batch (cost:$cost, amount:$initial_amount, bags:$number_of_bags)',
		async ({ initial_amount, cost, number_of_bags }) => {
			const production_date = someDate();
			const expiration_date = someDate();
			const batch_code = 'SOME CODE';
			const generated_id = `GN-${new Date().getTime()}`;

			const res = await purchases_service.registerBoughtIngrediets_EntryNote({
				supplier_id: FRUIT_SUPPLIER_ID,
				document: { number: generated_id },
				batches: [
					{
						batch_code,
						ingredient_id: APPLE_ID,
						initial_amount,
						production_date,
						expiration_date,
						cost,
						number_of_bags
					}
				]
			});
			expect(res.entry_id).toBeTruthy();
			expect(res.batchesId[0]).toBeTruthy();
			const entry = await db.select().from(t_ingridient_entry).then(getFirst);
			expect(entry.supplier_id).toBe(FRUIT_SUPPLIER_ID);
			expect(entry.creation_date).toBeTruthy();

			const docs = await db.select().from(t_entry_document);
			expect(docs.length).toBe(1);
			expect(docs[0].entry_id).toBe(entry.id);
			expect(docs[0].due_date).toBe(null);
			expect(docs[0].issue_date).toBe(null);
			expect(docs[0].number).toBe(generated_id);
			expect(docs[0].type).toBe('Nota de Ingreso');

			const batches = await db.select().from(t_ingredient_batch);
			expect(batches.length).toBe(1);
			const batch = batches[0];
			expect(batch.batch_code).toBe('SOME CODE');
			expect(batch.supplier_id).toBe(FRUIT_SUPPLIER_ID);
			expect(batch.entry_id).toBe(entry.id);
			expect(batch.cost).toBe(cost);
			expect(batch.state).toBe('AVAILABLE');
			expect(batch.number_of_bags).toBe(number_of_bags);
			expect(batch.initial_amount).toBe(initial_amount);
			expect(batch.adjustment).toBe(null);
			expect(justDate(batch.production_date)).toBe(justDate(production_date));
			expect(justDate(batch.expiration_date)).toBe(justDate(expiration_date));
			expect(batch.registration_date).toBeTruthy();
			expect(batch.withdrawal_tax_amount).toBe(0);
			expect(batch.iva_tax_percentage).toBe(0);
			expect(batch.currency_alpha_code).toBe('ARG');
			expect(batch.ingredient_id).toBe(APPLE_ID);
		}
	);
});

describe.sequential('buy ingredients with entry note, two batches', async () => {
	test.each([
		{
			case: 1,
			first: {
				batch_code: 'SOME CODE 1',
				ingredient_id: await ingredient_defaulter_service.add_simple(),
				initial_amount: 10,
				cost: 200,
				number_of_bags: 1,
				production_date: someDate(),
				expiration_date: someDate()
			},
			second: {
				batch_code: 'SOME CODE 2',
				ingredient_id: await ingredient_defaulter_service.add_simple(),
				initial_amount: 10,
				cost: 200,
				number_of_bags: 1,
				production_date: someDate(),
				expiration_date: someDate()
			}
		},
		{
			case: 2,
			first: {
				batch_code: 'SOME other CODE 1',
				ingredient_id: await ingredient_defaulter_service.add_simple(),
				initial_amount: 1,
				cost: 200_000,
				number_of_bags: 20,
				production_date: someDate(),
				expiration_date: someDate()
			},
			second: {
				batch_code: 'SOME CODE 2',
				ingredient_id: await ingredient_defaulter_service.add_simple(),
				initial_amount: 10.562132,
				cost: 200.23,
				number_of_bags: 1,
				production_date: someDate(),
				expiration_date: someDate()
			}
		}
	])('happy path with one batch (case: $case)', async ({ first, second }) => {
		const generated_id = `GN-${new Date().getTime()}`;

		const supplier_id = await suppliers_defaulter_service.add({
			ingredientsIds: only_unique([first.ingredient_id, second.ingredient_id])
		});
		const res = await purchases_service.registerBoughtIngrediets_EntryNote({
			supplier_id,
			document: { number: generated_id },
			batches: [first, second]
		});
		expect(res.entry_id).toBeTruthy();
		expect(res.batchesId[0]).toBeTruthy();
		const entry = await db.select().from(t_ingridient_entry).then(getFirst);
		expect(entry.supplier_id).toBe(supplier_id);
		expect(entry.creation_date).toBeTruthy();

		const docs = await db.select().from(t_entry_document);
		expect(docs.length).toBe(1);
		expect(docs[0].entry_id).toBe(entry.id);
		expect(docs[0].due_date).toBe(null);
		expect(docs[0].issue_date).toBe(null);
		expect(docs[0].number).toBe(generated_id);
		expect(docs[0].type).toBe('Nota de Ingreso');

		const batches = await db.select().from(t_ingredient_batch);
		expect(batches.length).toBe(2);
		const expected = [first, second];
		for (let i = 0; i < batches.length; i++) {
			expect(batches[i].batch_code).toBe(expected[i].batch_code);
			expect(batches[i].supplier_id).toBe(supplier_id);
			expect(batches[i].entry_id).toBe(entry.id);
			expect(batches[i].cost).toBe(expected[i].cost);
			expect(batches[i].state).toBe('AVAILABLE');
			expect(batches[i].number_of_bags).toBe(expected[i].number_of_bags);
			expect(batches[i].initial_amount).toBe(expected[i].initial_amount);
			expect(batches[i].adjustment).toBe(null);
			expect(justDate(batches[i].production_date)).toBe(justDate(expected[i].production_date));
			expect(justDate(batches[i].expiration_date)).toBe(justDate(expected[i].expiration_date));
			expect(batches[i].registration_date).toBeTruthy();
			expect(batches[i].withdrawal_tax_amount).toBe(0);
			expect(batches[i].iva_tax_percentage).toBe(0);
			expect(batches[i].currency_alpha_code).toBe('ARG');
			expect(batches[i].ingredient_id).toBe(expected[i].ingredient_id);
		}
	});
});
