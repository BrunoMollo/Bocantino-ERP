import { describe, vi, test, expect, beforeEach, beforeAll } from 'vitest';
import { db } from '$lib/server/db/__mocks__';
import {
	t_entry_document,
	t_ingredient_batch,
	t_ingridient_entry,
	tr_ingredient_batch_ingredient_batch
} from '$lib/server/db/schema';
import { __DELETE_ALL_DATABASE, compare_just_dates } from '../utils';
import { ingredient_defaulter_service } from '$logic/defaulters/ingredient-service.default';
import { suppliers_defaulter_service } from '$logic/defaulters/supplier-service.default';
import { purchases_defaulter_service } from '$logic/defaulters/purchase-service.default';
import { purchases_service } from '$logic/ingredient-purchase-service';
import { getFirst } from '$lib/utils';
import { eq } from 'drizzle-orm';

vi.mock('$lib/server/db/index.ts');

let LIVER_ID = -1;
let SUPPLIER_ID = -1;

beforeAll(async () => {
	await __DELETE_ALL_DATABASE();
	LIVER_ID = await ingredient_defaulter_service.add_simple();

	SUPPLIER_ID = await suppliers_defaulter_service.add({ ingredientsIds: [LIVER_ID] });
});
beforeEach(async () => {
	await db.delete(tr_ingredient_batch_ingredient_batch);
	await db.delete(t_ingredient_batch);
	await db.delete(t_entry_document);
	await db.delete(t_ingridient_entry);
	await db.delete(t_ingridient_entry);
});

async function create_test_entry(type: 'Remito' | 'Factura' | 'Nota de Ingreso') {
	return await purchases_defaulter_service.buy_return_entry_id({
		supplier_id: SUPPLIER_ID,
		bought: [{ ingredient_id: LIVER_ID, initial_amount: 100 }],
		type
	});
}

describe.sequential('assing invoice', () => {
	test('assign_invoice create a new document', async () => {
		const entry_id = await create_test_entry('Remito');

		const issue_date = new Date(2001, 9, 11);
		const due_date = new Date(2001, 4, 11);
		const res = await purchases_service.asign_invoice({
			entry_id,
			invoice_number: 'hola',
			issue_date,
			due_date,
			withdrawal_tax_amount: 100,
			iva_tax_percentage: 0.1
		});

		expect(res.type).toBe('SUCCESS');
		if (res.type == 'SUCCESS') {
			const new_doc = await db
				.select()
				.from(t_entry_document)
				.where(eq(t_entry_document.id, res.data.invoice_id))
				.then(getFirst);
			expect(new_doc.entry_id).toBe(entry_id);
			expect(new_doc.number).toBe('hola');
			compare_just_dates(new_doc.issue_date, issue_date, expect);
			compare_just_dates(new_doc.due_date, due_date, expect);
			expect(new_doc.type).toBe('Factura');
		}
	});

	test('assign_invoice update batches', async () => {
		const entry_id = await purchases_defaulter_service.buy_return_entry_id({
			supplier_id: SUPPLIER_ID,
			bought: [
				{ ingredient_id: LIVER_ID, initial_amount: 100 },
				{ ingredient_id: LIVER_ID, initial_amount: 100 }
			],
			type: 'Remito'
		});

		const prev_batches = await purchases_service.getBatchesByEntryId(entry_id);
		expect(prev_batches.length).toBe(2);
		expect(prev_batches[0].withdrawal_tax_amount).toBe(0);
		expect(prev_batches[0].iva_tax_percentage).toBe(0);
		expect(prev_batches[1].withdrawal_tax_amount).toBe(0);
		expect(prev_batches[1].iva_tax_percentage).toBe(0);

		const withdrawal_tax_amount = 100;
		const iva_tax_percentage = 0.1;

		const res = await purchases_service.asign_invoice({
			entry_id,
			invoice_number: 'hola',
			issue_date: new Date(),
			due_date: new Date(),
			withdrawal_tax_amount,
			iva_tax_percentage
		});

		expect(res.type).toBe('SUCCESS');
		if (res.type == 'SUCCESS') {
			const edited_batches = await purchases_service.getBatchesByEntryId(entry_id);
			expect(edited_batches.length).toBe(2);
			expect(edited_batches[0].withdrawal_tax_amount).toBe(withdrawal_tax_amount);
			expect(edited_batches[0].iva_tax_percentage).toBe(iva_tax_percentage);
			expect(edited_batches[1].withdrawal_tax_amount).toBe(withdrawal_tax_amount);
			expect(edited_batches[1].iva_tax_percentage).toBe(iva_tax_percentage);
		}
	});
});

describe.sequential('get entries with pending invoice', () => {
	test('simple case', async () => {
		const expectred_id = await create_test_entry('Remito');
		await create_test_entry('Nota de Ingreso');
		await create_test_entry('Factura');

		const entries = await purchases_service.get_entries_without_invoice();
		expect(entries.length).toBe(1);
		expect(entries[0].id).toBe(expectred_id);
	});

	test('simple case with 2 pending invoice', async () => {
		const expectred_id_1 = await create_test_entry('Remito');
		const expectred_id_2 = await create_test_entry('Remito');
		await create_test_entry('Nota de Ingreso');

		const entries = await purchases_service.get_entries_without_invoice();
		expect(entries.length).toBe(2);
		expect(entries.find((x) => x.id === expectred_id_1)).toBeTruthy();
		expect(entries.find((x) => x.id === expectred_id_2)).toBeTruthy();
	});

	test('omit entry with refer that already has an invoice', async () => {
		const entry_id = await create_test_entry('Remito');

		await purchases_service.asign_invoice({
			entry_id,
			invoice_number: 'hola',
			issue_date: new Date(),
			due_date: new Date(),
			withdrawal_tax_amount: 100,
			iva_tax_percentage: 0.1
		});

		const entries = await purchases_service.get_entries_without_invoice();
		expect(entries.length).toBe(0);
	});

	test('omit entry with refer that already has an invoice, show the one with still pending', async () => {
		const entry_id = await create_test_entry('Remito');
		const entry_id_pending = await create_test_entry('Remito');
		await create_test_entry('Nota de Ingreso');

		await purchases_service.asign_invoice({
			entry_id,
			invoice_number: 'hola',
			issue_date: new Date(),
			due_date: new Date(),
			withdrawal_tax_amount: 100,
			iva_tax_percentage: 0.1
		});

		const entries = await purchases_service.get_entries_without_invoice();
		expect(entries.length).toBe(1);
		expect(entries[0].id).toBe(entry_id_pending);
	});
});
