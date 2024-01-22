import { describe, expect, vi, test, beforeEach, beforeAll } from 'vitest';
import { INVOICE_TYPE, db } from '$lib/server/db/__mocks__';
import {
	t_document_type,
	t_entry_document,
	t_ingredient_batch,
	t_ingridient_entry
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { ingredients_service, purchases_service } from '$logic';
import { __DELETE_ALL_DATABASE } from './utils';
import { suppliers_service } from '$logic/suppliers-service';

vi.mock('$lib/server/db/index.ts');

let BANANA: { id: number };
let JUAN: { id: number };
beforeAll(async () => {
	await __DELETE_ALL_DATABASE();
	await db.insert(t_document_type).values(INVOICE_TYPE);

	BANANA = await ingredients_service.add({ name: 'Banana', unit: 'Kg', reorderPoint: 20 });
	JUAN = await suppliers_service.add({
		name: 'Juan Provide',
		email: 'prov@prov.com',
		ingredientsIds: [BANANA.id]
	});
});

beforeEach(async () => {
	await db.delete(t_ingredient_batch);
	await db.delete(t_ingridient_entry);
	await db.delete(t_entry_document);
});

describe.sequential('buy ingredients', async () => {
	let VAILD_INPUT_1B: Parameters<typeof purchases_service.registerBoughtIngrediets>[0];
	beforeAll(() => {
		VAILD_INPUT_1B = {
			supplierId: JUAN.id,
			document: {
				typeId: INVOICE_TYPE.id,
				number: 'FACTURA-12345',
				issue_date: new Date(2023, 1, 1),
				due_date: new Date(2023, 2, 2)
			},
			batches: [
				{
					batch_code: 'ABC123',
					numberOfBags: 100,
					initialAmount: 500,
					productionDate: new Date(2000, 1, 1), // Example timestamp for January 1, 2000
					expiration_date: new Date(2000, 1, 20), // Example timestamp for January 20, 2000
					cost: 5000,
					ingredientId: BANANA.id
				}
			]
		};
	});
	describe.sequential('valid case, one batches', () => {
		test('creates new document row', async () => {
			await purchases_service.registerBoughtIngrediets(VAILD_INPUT_1B);
			const listDocs = await db.select().from(t_entry_document);
			expect(listDocs.length).toBe(1);
			const newDoc = listDocs[0];
			expect(newDoc).toBeTruthy();
			expect(newDoc.id).toBeTruthy();
			expect(newDoc.typeId).toBe(INVOICE_TYPE.id);
			expect(newDoc.number).toBe(VAILD_INPUT_1B.document.number);
			expect(newDoc.issue_date.toISOString().split('T')[0]).toBe(
				VAILD_INPUT_1B.document.issue_date.toISOString().split('T')[0]
			);
			expect(newDoc.due_date.toISOString().split('T')[0]).toBe(
				VAILD_INPUT_1B.document.due_date.toISOString().split('T')[0]
			);
		});
		test('creates new entry row', async () => {
			await purchases_service.registerBoughtIngrediets(VAILD_INPUT_1B);
			const entryList = await db.select().from(t_ingridient_entry);
			expect(entryList.length).toBe(1);
			expect(entryList[0]).toBeTruthy();
			expect(entryList[0].id).toBeTruthy();
			expect(entryList[0].currency_alpha_code).toBe('ARG');
			expect(entryList[0].totalCost).toBe(null);
			expect(entryList[0].documentId).toBeTruthy();
			const referencedDoc = await db
				.select()
				.from(t_entry_document)
				.where(eq(t_entry_document.id, entryList[0].documentId ?? -1));
			expect(referencedDoc.length).toBe(1);
			expect(referencedDoc[0].typeId).toBe(INVOICE_TYPE.id);
		});

		test('save the batch', async () => {
			await purchases_service.registerBoughtIngrediets(VAILD_INPUT_1B);
			const list = await db.select().from(t_ingredient_batch);
			expect(list.length).toBe(VAILD_INPUT_1B.batches.length);
			expect(list[0].id).toBeTruthy();
			expect(list[0].ingredientId).toBe(BANANA.id);
			expect(list[0].supplierId).toBe(JUAN.id);
			expect(list[0].currency_alpha_code).toBe('ARG');
			expect(list[0].cost).toBe(VAILD_INPUT_1B.batches[0].cost);
			expect(list[0].batch_code).toBe(VAILD_INPUT_1B.batches[0].batch_code);
			expect(list[0].numberOfBags).toBe(VAILD_INPUT_1B.batches[0].numberOfBags);
			expect(list[0].initialAmount).toBe(VAILD_INPUT_1B.batches[0].initialAmount);
			expect(list[0].expiration_date?.toISOString().split('T')[0]).toBe(
				VAILD_INPUT_1B.batches[0].expiration_date.toISOString().split('T')[0]
			);
			expect(list[0].productionDate?.toISOString().split('T')[0]).toBe(
				VAILD_INPUT_1B.batches[0].productionDate.toISOString().split('T')[0]
			);

			expect(list[0].adjustment).toBe(null);
		});
	});

	describe.sequential('valid case, two batches', () => {
		let VALID_INPUT_2B: Parameters<typeof purchases_service.registerBoughtIngrediets>[0];

		beforeAll(() => {
			VALID_INPUT_2B = {
				supplierId: JUAN.id,
				document: {
					typeId: INVOICE_TYPE.id,
					number: 'FACTURA-12345',
					issue_date: new Date(2023, 1, 1),
					due_date: new Date(2023, 2, 2)
				},
				batches: [
					{
						batch_code: 'ABC123',
						numberOfBags: 100,
						initialAmount: 500,
						productionDate: new Date(2000, 1, 1), // Example timestamp for January 1, 2000
						expiration_date: new Date(2000, 1, 20), // Example timestamp for January 20, 2000
						cost: 5000,
						ingredientId: BANANA.id
					},

					{
						batch_code: 'XYZ123',
						numberOfBags: 200,
						initialAmount: 530,
						productionDate: new Date(2000, 1, 1), // Example timestamp for January 1, 2000
						expiration_date: new Date(2000, 1, 20), // Example timestamp for January 20, 2000
						cost: 5000,
						ingredientId: BANANA.id
					}
				]
			};
		});
		test('creates new document row', async () => {
			await purchases_service.registerBoughtIngrediets(VALID_INPUT_2B);
			const listDocs = await db.select().from(t_entry_document);
			expect(listDocs.length).toBe(1);
			const newDoc = listDocs[0];
			expect(newDoc).toBeTruthy();
			expect(newDoc.id).toBeTruthy();
			expect(newDoc.typeId).toBe(INVOICE_TYPE.id);
			expect(newDoc.number).toBe(VALID_INPUT_2B.document.number);
			expect(newDoc.issue_date.toISOString().split('T')[0]).toBe(
				VALID_INPUT_2B.document.issue_date.toISOString().split('T')[0]
			);
			expect(newDoc.due_date.toISOString().split('T')[0]).toBe(
				VALID_INPUT_2B.document.due_date.toISOString().split('T')[0]
			);
		});
		test('creates new entry row', async () => {
			await purchases_service.registerBoughtIngrediets(VALID_INPUT_2B);
			const entryList = await db.select().from(t_ingridient_entry);
			expect(entryList.length).toBe(1);
			expect(entryList[0]).toBeTruthy();
			expect(entryList[0].id).toBeTruthy();
			expect(entryList[0].currency_alpha_code).toBe('ARG');
			expect(entryList[0].totalCost).toBe(null);
			expect(entryList[0].documentId).toBeTruthy();
			const referencedDoc = await db
				.select()
				.from(t_entry_document)
				.where(eq(t_entry_document.id, entryList[0].documentId ?? -1));
			expect(referencedDoc.length).toBe(1);
			expect(referencedDoc[0].typeId).toBe(INVOICE_TYPE.id);
		});

		test('save the two batches', async () => {
			const result = await purchases_service.registerBoughtIngrediets(VALID_INPUT_2B);
			const list = await db.select().from(t_ingredient_batch);
			expect(list.length).toBe(VALID_INPUT_2B.batches.length);
			for (let i of [0, 1]) {
				expect(list[i].id).toBeTruthy();
				expect(list[i].ingredientId).toBe(BANANA.id);
				expect(list[i].supplierId).toBe(JUAN.id);
				expect(list[i].currency_alpha_code).toBe('ARG');
				expect(list[i].cost).toBe(VALID_INPUT_2B.batches[i].cost);
				expect(list[i].batch_code).toBe(VALID_INPUT_2B.batches[i].batch_code);
				expect(list[i].numberOfBags).toBe(VALID_INPUT_2B.batches[i].numberOfBags);
				expect(list[i].initialAmount).toBe(VALID_INPUT_2B.batches[i].initialAmount);
				expect(list[i].expiration_date?.toISOString().split('T')[0]).toBe(
					VALID_INPUT_2B.batches[i].expiration_date.toISOString().split('T')[0]
				);
				expect(list[i].expiration_date?.toISOString().split('T')[0]).toBe(
					VALID_INPUT_2B.batches[i].expiration_date.toISOString().split('T')[0]
				);
				expect(list[i].productionDate?.toISOString().split('T')[0]).toBe(
					VALID_INPUT_2B.batches[i].productionDate.toISOString().split('T')[0]
				);
				expect(list[i].adjustment).toBe(null);
				expect(list[i].entry_id).toBeTruthy();
				expect(list[i].entry_id).toBe(result.entry_id);
			}
		});
	});
});

