import { describe, expect, vi, test, beforeEach, beforeAll } from 'vitest';
import { db } from '$lib/server/db/__mocks__';
import {
	t_entry_document,
	t_ingredient_batch,
	t_ingridient_entry,
	t_product_batch,
	tr_product_batch_ingredient_batch
} from '$lib/server/db/schema';
import { __DELETE_ALL_DATABASE } from '../utils';
import { eq } from 'drizzle-orm';
import { ingredient_defaulter_service } from '$logic/defaulters/ingredient-service.default';
import { suppliers_defaulter_service } from '$logic/defaulters/supplier-service.default';
import { purchases_defaulter_service } from '$logic/defaulters/purchase-service.default';
import { purchases_service } from '$logic/ingredient-purchase-service';

vi.mock('$lib/server/db/index.ts');

let LIVER_ID = -1;
let SUPPLIER_ID = -1;
let REFER_ENRTY_ID = -1;
let NOTE_ENRTY_ID = -1;

beforeAll(async () => {
	await __DELETE_ALL_DATABASE();
	LIVER_ID = await ingredient_defaulter_service.add_simple();
	SUPPLIER_ID = await suppliers_defaulter_service.add({ ingredientsIds: [LIVER_ID] });
});

beforeEach(async () => {
	await db.delete(tr_product_batch_ingredient_batch);
	await db.delete(t_product_batch);
	await db.delete(t_ingredient_batch);
	await db.delete(t_entry_document);
	await db.delete(t_ingridient_entry);

	REFER_ENRTY_ID = await purchases_defaulter_service.buy_return_entry_id({
		supplier_id: SUPPLIER_ID,
		bought: [
			{ ingredient_id: LIVER_ID, initial_amount: 100 },
			{ ingredient_id: LIVER_ID, initial_amount: 200 }
		],
		type: 'Remito'
	});

	NOTE_ENRTY_ID = await purchases_defaulter_service.buy_return_entry_id({
		supplier_id: SUPPLIER_ID,
		bought: [{ ingredient_id: LIVER_ID, initial_amount: 10000 }],
		type: 'Nota de Ingreso'
	});
});

describe('Add invoice to entry by refer', () => {
	test('error when entry does not exist', async () => {
		const batches_id = await purchases_service
			.getBatchesByEntryId(REFER_ENRTY_ID)
			.then((x) => x.map((e) => e.id));

		const res = await purchases_service.add_invoice_to_entry({
			entry_id: REFER_ENRTY_ID * 23,
			invoice: {
				number: 'dsadsad',
				issue_date: new Date(),
				due_date: new Date()
			},
			withdrawal_tax_amount: 300,
			iva_tax_percentage: 50,
			batches: [
				{
					batch_id: batches_id[0],
					cost: 200
				},
				{
					batch_id: batches_id[1],
					cost: 400
				}
			]
		});
		expect(res.type).toBe('LOGIC_ERROR');
	});

	test('error when entry is not by refer', async () => {
		const batches_id = await purchases_service
			.getBatchesByEntryId(NOTE_ENRTY_ID)
			.then((x) => x.map((e) => e.id));

		const res = await purchases_service.add_invoice_to_entry({
			entry_id: NOTE_ENRTY_ID,
			invoice: {
				number: 'dsadsad',
				issue_date: new Date(),
				due_date: new Date()
			},
			withdrawal_tax_amount: 300,
			iva_tax_percentage: 50,
			batches: [
				{
					batch_id: batches_id[0],
					cost: 200
				}
			]
		});
		expect(res.type).toBe('LOGIC_ERROR');
	});

	test('happy path doesnt affect other enties', async () => {
		const batches_id = await purchases_service
			.getBatchesByEntryId(REFER_ENRTY_ID)
			.then((x) => x.map((e) => e.id));

		const res = await purchases_service.add_invoice_to_entry({
			entry_id: REFER_ENRTY_ID,
			invoice: {
				number: 'dsadsad',
				issue_date: new Date(),
				due_date: new Date()
			},
			withdrawal_tax_amount: 300,
			iva_tax_percentage: 50,
			batches: [
				{
					batch_id: batches_id[0],
					cost: 200
				},
				{
					batch_id: batches_id[1],
					cost: 400
				}
			]
		});
		expect(res.type).toBe('SUCCESS');
		const entry = await purchases_service.getEntryById(NOTE_ENRTY_ID);
		expect(entry?.document.type).toBe('Nota de Ingreso');
		const batches = await db
			.select()
			.from(t_ingredient_batch)
			.where(eq(t_ingredient_batch.entry_id, NOTE_ENRTY_ID));
		for (const b of batches) {
			expect(b.withdrawal_tax_amount).not.toBe(300);
			expect(b.iva_tax_percentage).not.toBe(50);
		}
	});

	test('happy path  affect  enty', async () => {
		const batches_id = await purchases_service
			.getBatchesByEntryId(REFER_ENRTY_ID)
			.then((x) => x.map((e) => e.id));
		const res = await purchases_service.add_invoice_to_entry({
			entry_id: REFER_ENRTY_ID,
			invoice: {
				number: 'dsadsad',
				issue_date: new Date(),
				due_date: new Date()
			},
			withdrawal_tax_amount: 300,
			iva_tax_percentage: 50,
			batches: [
				{
					batch_id: batches_id[0],
					cost: 200
				},
				{
					batch_id: batches_id[1],
					cost: 400
				}
			]
		});
		expect(res.type).toBe('SUCCESS');
		const entry = await purchases_service.getEntryById(REFER_ENRTY_ID);
		expect(entry?.document.type).toBe('Factura');
		const batches = await db
			.select()
			.from(t_ingredient_batch)
			.where(eq(t_ingredient_batch.entry_id, REFER_ENRTY_ID));
		for (const b of batches) {
			expect(b.withdrawal_tax_amount).toBe(300);
			expect(b.iva_tax_percentage).toBe(50);
		}
	});

	test('validate that all bathces are correpsoing to the entry (only one)', async () => {
		const batches_id = await purchases_service
			.getBatchesByEntryId(NOTE_ENRTY_ID)
			.then((x) => x.map((e) => e.id));
		const res = await purchases_service.add_invoice_to_entry({
			entry_id: REFER_ENRTY_ID,
			invoice: {
				number: 'dsadsad',
				issue_date: new Date(),
				due_date: new Date()
			},
			withdrawal_tax_amount: 300,
			iva_tax_percentage: 50,
			batches: [
				{
					batch_id: batches_id[0],
					cost: 200
				}
			]
		});
		expect(res.type).toBe('LOGIC_ERROR');
	});

	test('validate that all bathces are correpsoing to the entry (all and one wrong)', async () => {
		const batches_id_note = await purchases_service
			.getBatchesByEntryId(NOTE_ENRTY_ID)
			.then((x) => x.map((e) => e.id));

		const batches_id_refer = await purchases_service
			.getBatchesByEntryId(REFER_ENRTY_ID)
			.then((x) => x.map((e) => e.id));

		const res = await purchases_service.add_invoice_to_entry({
			entry_id: REFER_ENRTY_ID,
			invoice: {
				number: 'dsadsad',
				issue_date: new Date(),
				due_date: new Date()
			},
			withdrawal_tax_amount: 300,
			iva_tax_percentage: 50,
			batches: [
				{
					batch_id: batches_id_refer[0],
					cost: 200
				},
				{
					batch_id: batches_id_refer[1],
					cost: 200
				},
				{
					batch_id: batches_id_note[0],
					cost: 200
				}
			]
		});
		expect(res.type).toBe('LOGIC_ERROR');
	});

	test('validate that all bathces are correpsoing to the entry (one right and one wrong) (1)', async () => {
		const batches_id_note = await purchases_service
			.getBatchesByEntryId(NOTE_ENRTY_ID)
			.then((x) => x.map((e) => e.id));

		const batches_id_refer = await purchases_service
			.getBatchesByEntryId(REFER_ENRTY_ID)
			.then((x) => x.map((e) => e.id));

		const res = await purchases_service.add_invoice_to_entry({
			entry_id: REFER_ENRTY_ID,
			invoice: {
				number: 'dsadsad',
				issue_date: new Date(),
				due_date: new Date()
			},
			withdrawal_tax_amount: 300,
			iva_tax_percentage: 50,
			batches: [
				{
					batch_id: batches_id_refer[0],
					cost: 200
				},
				{
					batch_id: batches_id_note[0],
					cost: 200
				}
			]
		});
		expect(res.type).toBe('LOGIC_ERROR');
	});

	test('validate that all bathces are correpsoing to the entry (one right and one wrong) (2)', async () => {
		const batches_id_note = await purchases_service
			.getBatchesByEntryId(NOTE_ENRTY_ID)
			.then((x) => x.map((e) => e.id));

		const batches_id_refer = await purchases_service
			.getBatchesByEntryId(REFER_ENRTY_ID)
			.then((x) => x.map((e) => e.id));

		const res = await purchases_service.add_invoice_to_entry({
			entry_id: REFER_ENRTY_ID,
			invoice: {
				number: 'dsadsad',
				issue_date: new Date(),
				due_date: new Date()
			},
			withdrawal_tax_amount: 300,
			iva_tax_percentage: 50,
			batches: [
				{
					batch_id: batches_id_refer[1],
					cost: 200
				},
				{
					batch_id: batches_id_note[0],
					cost: 200
				}
			]
		});
		expect(res.type).toBe('LOGIC_ERROR');
	});

	test('validate that any bathc of the entry is missing (1)', async () => {
		const batches_id_refer = await purchases_service
			.getBatchesByEntryId(REFER_ENRTY_ID)
			.then((x) => x.map((e) => e.id));

		const res = await purchases_service.add_invoice_to_entry({
			entry_id: REFER_ENRTY_ID,
			invoice: {
				number: 'dsadsad',
				issue_date: new Date(),
				due_date: new Date()
			},
			withdrawal_tax_amount: 300,
			iva_tax_percentage: 50,
			batches: [
				{
					batch_id: batches_id_refer[1],
					cost: 200
				}
			]
		});
		expect(res.type).toBe('LOGIC_ERROR');
	});

	test('validate that any bathc of the entry is missing (2)', async () => {
		const batches_id_refer = await purchases_service
			.getBatchesByEntryId(REFER_ENRTY_ID)
			.then((x) => x.map((e) => e.id));

		const res = await purchases_service.add_invoice_to_entry({
			entry_id: REFER_ENRTY_ID,
			invoice: {
				number: 'dsadsad',
				issue_date: new Date(),
				due_date: new Date()
			},
			withdrawal_tax_amount: 300,
			iva_tax_percentage: 50,
			batches: [
				{
					batch_id: batches_id_refer[0],
					cost: 200
				}
			]
		});
		expect(res.type).toBe('LOGIC_ERROR');
	});
});
