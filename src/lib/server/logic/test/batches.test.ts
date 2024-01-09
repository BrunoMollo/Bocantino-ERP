import { describe, expect, vi, test, beforeEach, beforeAll } from 'vitest';
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
import type { RegisterPurchaseDto } from '../purchases-logic';
import { eq } from 'drizzle-orm';
import { purchases_service } from '$logic';

vi.mock('$lib/server/db/index.ts');

describe.sequential('buy ingredients', async () => {
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

		await db
			.insert(t_ingredient)
			.values({ id: 1, name: 'Banana', unit: 'Kilogramos', reorderPoint: 20 });
		await db.insert(t_supplier).values({ id: 1, name: 'Juan Porvide', email: 'prov@prov.com' });
		await db.insert(tr_supplier_ingredient).values({ ingredientId: 1, supplierId: 1 });
	});

	beforeEach(async () => {
		await db.delete(t_ingredient_batch);
		await db.delete(t_ingridient_entry);
		await db.delete(t_entry_document);
	});

	describe('valid case, one batches', () => {
		const valid_input = {
			supplierId: 1,
			document: {
				number: 'FACTURA-12345',
				issue_date: new Date(2023, 1, 1),
				typeId: INVOICE_TYPE.id
			},
			batches: [
				{
					batch_code: 'ABC123',
					numberOfBags: 100,
					initialAmount: 500,
					productionDate: new Date(2000, 1, 1), // Example timestamp for January 1, 2000
					expirationDate: new Date(2000, 1, 20), // Example timestamp for January 20, 2000
					cost: 5000,
					ingredientId: 1
				}
			]
		} satisfies RegisterPurchaseDto;
		test('creates new document row', async () => {
			await purchases_service.registerBoughtIngrediets(valid_input);
			const listDocs = await db.select().from(t_entry_document);
			expect(listDocs.length).toBe(1);
			const newDoc = listDocs[0];
			expect(newDoc).toBeTruthy();
			expect(newDoc.id).toBeTruthy();
			expect(newDoc.typeId).toBe(INVOICE_TYPE.id);
			expect(newDoc.number).toBe(valid_input.document.number);
			expect(newDoc.issue_date.toISOString()).toBe(valid_input.document.issue_date.toISOString());
		});
		test('creates new entry row', async () => {
			await purchases_service.registerBoughtIngrediets(valid_input);
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
			expect(referencedDoc[0].typeId).toBe(1); //Invoice
		});

		test('save the batch', async () => {
			await purchases_service.registerBoughtIngrediets(valid_input);
			const list = await db.select().from(t_ingredient_batch);
			expect(list.length).toBe(valid_input.batches.length);
			expect(list[0].id).toBeTruthy();
			expect(list[0].ingredientId).toBe(1);
			expect(list[0].supplierId).toBe(1);
			expect(list[0].currency_alpha_code).toBe('ARG');
			expect(list[0].cost).toBe(valid_input.batches[0].cost);
			expect(list[0].batch_code).toBe(valid_input.batches[0].batch_code);
			expect(list[0].numberOfBags).toBe(valid_input.batches[0].numberOfBags);
			expect(list[0].initialAmount).toBe(valid_input.batches[0].initialAmount);
			expect(list[0].expirationDate.toISOString()).toBe(
				valid_input.batches[0].expirationDate.toISOString()
			);
			expect(list[0].productionDate?.toISOString()).toBe(
				valid_input.batches[0].productionDate.toISOString()
			);

			expect(list[0].loss).toBe(null);
		});
	});

	describe('valid case, two batches', () => {
		const valid_input = {
			supplierId: 1,
			document: {
				number: 'FACTURA-12345',
				issue_date: new Date(2023, 1, 1),
				typeId: INVOICE_TYPE.id
			},
			batches: [
				{
					batch_code: 'ABC123',
					numberOfBags: 100,
					initialAmount: 500,
					productionDate: new Date(2000, 1, 1), // Example timestamp for January 1, 2000
					expirationDate: new Date(2000, 1, 20), // Example timestamp for January 20, 2000
					cost: 5000,
					ingredientId: 1
				},

				{
					batch_code: 'XYZ123',
					numberOfBags: 200,
					initialAmount: 530,
					productionDate: new Date(2000, 1, 1), // Example timestamp for January 1, 2000
					expirationDate: new Date(2000, 1, 20), // Example timestamp for January 20, 2000
					cost: 5000,
					ingredientId: 1
				}
			]
		} satisfies RegisterPurchaseDto;
		test('creates new document row', async () => {
			await purchases_service.registerBoughtIngrediets(valid_input);
			const listDocs = await db.select().from(t_entry_document);
			expect(listDocs.length).toBe(1);
			const newDoc = listDocs[0];
			expect(newDoc).toBeTruthy();
			expect(newDoc.id).toBeTruthy();
			expect(newDoc.typeId).toBe(INVOICE_TYPE.id);
			expect(newDoc.number).toBe(valid_input.document.number);
			expect(newDoc.issue_date.toISOString()).toBe(valid_input.document.issue_date.toISOString());
		});
		test('creates new entry row', async () => {
			await purchases_service.registerBoughtIngrediets(valid_input);
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
			expect(referencedDoc[0].typeId).toBe(1); //Invoice
		});

		test('save the two batches', async () => {
			const result = await purchases_service.registerBoughtIngrediets(valid_input);
			const list = await db.select().from(t_ingredient_batch);
			expect(list.length).toBe(valid_input.batches.length);
			for (let i of [0, 1]) {
				expect(list[i].id).toBeTruthy();
				expect(list[i].ingredientId).toBe(1);
				expect(list[i].supplierId).toBe(1);
				expect(list[i].currency_alpha_code).toBe('ARG');
				expect(list[i].cost).toBe(valid_input.batches[i].cost);
				expect(list[i].batch_code).toBe(valid_input.batches[i].batch_code);
				expect(list[i].numberOfBags).toBe(valid_input.batches[i].numberOfBags);
				expect(list[i].initialAmount).toBe(valid_input.batches[i].initialAmount);
				expect(list[i].expirationDate.toISOString()).toBe(
					valid_input.batches[i].expirationDate.toISOString()
				);
				expect(list[i].productionDate?.toISOString()).toBe(
					valid_input.batches[i].productionDate.toISOString()
				);
				expect(list[i].loss).toBe(null);
				expect(list[i].entry_id).toBeTruthy();
				expect(list[i].entry_id).toBe(result.entry_id);
			}
		});
	});
});

