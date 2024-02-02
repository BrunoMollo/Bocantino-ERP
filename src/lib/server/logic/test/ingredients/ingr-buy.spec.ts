import { describe, expect, vi, test, beforeEach, beforeAll } from 'vitest';
import { INVOICE_TYPE, db } from '$lib/server/db/__mocks__';
import {
	t_document_type,
	t_entry_document,
	t_ingredient_batch,
	t_ingridient_entry
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { __DELETE_ALL_DATABASE } from '../utils';
import { suppliers_service } from '$logic/suppliers-service';
import { purchases_service } from '$logic/ingredient-purchase-service';
import { ingredients_service } from '$logic/ingredient-service';

vi.mock('$lib/server/db/index.ts');

let BANANA: { id: number };
let JUAN: { id: number };
beforeAll(async () => {
	await __DELETE_ALL_DATABASE();
	await db.insert(t_document_type).values(INVOICE_TYPE);

	BANANA = await ingredients_service.add({ name: 'Banana', unit: 'Kg', reorder_point: 20 });
	JUAN = await suppliers_service.add({
		name: 'Juan Provide',
		email: 'prov@prov.com',
		cuit: '123456789',
		phone_number: '3364123456',
		address: 'Fake Street 123',
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
			supplier_id: JUAN.id,
			perceptions_tax_amount: 10,
			iva_tax_percentage: 21,
			document: {
				typeId: INVOICE_TYPE.id,
				number: 'FACTURA-12345',
				issue_date: new Date(2023, 1, 1),
				due_date: new Date(2023, 2, 2)
			},
			batches: [
				{
					batch_code: 'ABC123',
					number_of_bags: 100,
					initial_amount: 500,
					production_date: new Date(2000, 1, 1), // Example timestamp for January 1, 2000
					expiration_date: new Date(2000, 1, 20), // Example timestamp for January 20, 2000
					cost: 5000,
					ingredient_id: BANANA.id
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
			expect(entryList[0].total_cost).toBe(null);
			expect(entryList[0].document_id).toBeTruthy();
			const referencedDoc = await db
				.select()
				.from(t_entry_document)
				.where(eq(t_entry_document.id, entryList[0].document_id ?? -1));
			expect(referencedDoc.length).toBe(1);
			expect(referencedDoc[0].typeId).toBe(INVOICE_TYPE.id);
		});

		test('save the batch', async () => {
			await purchases_service.registerBoughtIngrediets(VAILD_INPUT_1B);
			const list = await db.select().from(t_ingredient_batch);
			expect(list.length).toBe(VAILD_INPUT_1B.batches.length);
			expect(list[0].id).toBeTruthy();
			expect(list[0].ingredient_id).toBe(BANANA.id);
			expect(list[0].supplier_id).toBe(JUAN.id);
			expect(list[0].currency_alpha_code).toBe('ARG');
			expect(list[0].cost).toBe(VAILD_INPUT_1B.batches[0].cost);
			expect(list[0].batch_code).toBe(VAILD_INPUT_1B.batches[0].batch_code);
			expect(list[0].number_of_bags).toBe(VAILD_INPUT_1B.batches[0].number_of_bags);
			expect(list[0].initial_amount).toBe(VAILD_INPUT_1B.batches[0].initial_amount);
			expect(list[0].expiration_date?.toISOString().split('T')[0]).toBe(
				VAILD_INPUT_1B.batches[0].expiration_date.toISOString().split('T')[0]
			);
			expect(list[0].production_date?.toISOString().split('T')[0]).toBe(
				VAILD_INPUT_1B.batches[0].production_date.toISOString().split('T')[0]
			);

			expect(list[0].iva_tax_percentage).toBe(21);
			expect(list[0].perceptions_tax_amount).toBe(10);
			expect(list[0].adjustment).toBe(null);
		});
	});

	describe.sequential('valid case, two batches', () => {
		let VALID_INPUT_2B: Parameters<typeof purchases_service.registerBoughtIngrediets>[0];

		beforeAll(() => {
			VALID_INPUT_2B = {
				perceptions_tax_amount: 10,
				iva_tax_percentage: 21,
				supplier_id: JUAN.id,
				document: {
					typeId: INVOICE_TYPE.id,
					number: 'FACTURA-12345',
					issue_date: new Date(2023, 1, 1),
					due_date: new Date(2023, 2, 2)
				},
				batches: [
					{
						batch_code: 'ABC123',
						number_of_bags: 100,
						initial_amount: 500,
						production_date: new Date(2000, 1, 1), // Example timestamp for January 1, 2000
						expiration_date: new Date(2000, 1, 20), // Example timestamp for January 20, 2000
						cost: 5000,
						ingredient_id: BANANA.id
					},

					{
						batch_code: 'XYZ123',
						number_of_bags: 200,
						initial_amount: 530,
						production_date: new Date(2000, 1, 1), // Example timestamp for January 1, 2000
						expiration_date: new Date(2000, 1, 20), // Example timestamp for January 20, 2000
						cost: 5000,
						ingredient_id: BANANA.id
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
			expect(entryList[0].total_cost).toBe(null);
			expect(entryList[0].document_id).toBeTruthy();
			const referencedDoc = await db
				.select()
				.from(t_entry_document)
				.where(eq(t_entry_document.id, entryList[0].document_id ?? -1));
			expect(referencedDoc.length).toBe(1);
			expect(referencedDoc[0].typeId).toBe(INVOICE_TYPE.id);
		});

		test('save the two batches', async () => {
			const result = await purchases_service.registerBoughtIngrediets(VALID_INPUT_2B);
			const list = await db.select().from(t_ingredient_batch);
			expect(list.length).toBe(VALID_INPUT_2B.batches.length);
			for (let i of [0, 1]) {
				expect(list[i].id).toBeTruthy();
				expect(list[i].ingredient_id).toBe(BANANA.id);
				expect(list[i].supplier_id).toBe(JUAN.id);
				expect(list[i].currency_alpha_code).toBe('ARG');
				expect(list[i].cost).toBe(VALID_INPUT_2B.batches[i].cost);
				expect(list[i].batch_code).toBe(VALID_INPUT_2B.batches[i].batch_code);
				expect(list[i].number_of_bags).toBe(VALID_INPUT_2B.batches[i].number_of_bags);
				expect(list[i].initial_amount).toBe(VALID_INPUT_2B.batches[i].initial_amount);
				expect(list[i].expiration_date?.toISOString().split('T')[0]).toBe(
					VALID_INPUT_2B.batches[i].expiration_date.toISOString().split('T')[0]
				);
				expect(list[i].expiration_date?.toISOString().split('T')[0]).toBe(
					VALID_INPUT_2B.batches[i].expiration_date.toISOString().split('T')[0]
				);
				expect(list[i].production_date?.toISOString().split('T')[0]).toBe(
					VALID_INPUT_2B.batches[i].production_date.toISOString().split('T')[0]
				);
				expect(list[i].adjustment).toBe(null);
				expect(list[i].entry_id).toBeTruthy();
				expect(list[i].entry_id).toBe(result.entry_id);
			}
		});
	});
});

