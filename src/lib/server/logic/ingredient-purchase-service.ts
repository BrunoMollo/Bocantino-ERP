import { getFirst, getFirstIfPosible } from '$lib/utils';
import {
	t_entry_document,
	t_ingredient,
	t_ingredient_batch,
	t_ingridient_entry,
	t_supplier
} from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { and, between, count, eq, like } from 'drizzle-orm';
import { pick_merge } from 'drizzle-tools/src/pick-columns';
import { is_ok, logic_error } from '$logic';

export type InvoiceData = {
	number: string;
	issue_date: Date;
	due_date: Date;
};

type BatchFromInvoice = {
	ingredient_id: number;
	batch_code: string;
	initial_amount: number;
	production_date: Date;
	expiration_date: Date;
	number_of_bags: number;
	cost: number;
};
export class IngredientPurchaseService {
	async getEntryById(entry_id: number) {
		return await db
			.select({
				id: t_ingridient_entry.id,
				supplier: t_supplier.name,
				date: t_ingridient_entry.creation_date,
				document: pick_merge().table(t_entry_document, 'number', 'issue_date', 'type').build()
			})
			.from(t_ingridient_entry)
			.innerJoin(t_supplier, eq(t_supplier.id, t_ingridient_entry.supplier_id))
			.innerJoin(t_entry_document, eq(t_entry_document.entry_id, t_ingridient_entry.id))
			.where(eq(t_ingridient_entry.id, entry_id))
			.then(getFirstIfPosible);
	}

	/*
	 * We thought that the entry of ingredient always was by Invoice, we were wrong as hell.
	 * We left this as a generic implemetation for entering ingredients with diferent process
	 * */
	private registerBoughtIngrediets(
		data: {
			supplier_id: number;
			document: InvoiceData;
			withdrawal_tax_amount: number;
			iva_tax_percentage: number;
			batches: BatchFromInvoice[];
		},
		doc_type: DocumentType
	) {
		return db.transaction(async (tx) => {
			const { entry_id } = await tx
				.insert(t_ingridient_entry)
				.values({ total_cost: null, supplier_id: data.supplier_id })
				.returning({ entry_id: t_ingridient_entry.id })
				.then(getFirst);

			const doc = { ...data.document, type: doc_type, entry_id };
			await tx
				.insert(t_entry_document)
				.values(doc)
				.returning({ document_id: t_entry_document.id })
				.then(getFirst);

			const { supplier_id, iva_tax_percentage, withdrawal_tax_amount } = data;
			const batchesId = [] as number[];
			for (const batch of data.batches) {
				const inserted = await tx
					.insert(t_ingredient_batch)
					.values({
						...batch,
						supplier_id,
						state: 'AVAILABLE',
						entry_id,
						iva_tax_percentage,
						withdrawal_tax_amount
					})
					.returning({ id: t_ingredient_batch.id })
					.then(getFirst);
				batchesId.push(inserted.id);
			}
			return { entry_id, batchesId };
		});
	}

	registerBoughtIngrediets_Invoice(data: {
		supplier_id: number;
		document: InvoiceData;
		withdrawal_tax_amount: number;
		iva_tax_percentage: number;
		batches: BatchFromInvoice[];
	}) {
		return this.registerBoughtIngrediets(data, 'Factura');
	}

	public async getLastEntries() {
		const entries = await db
			.select({
				id: t_ingridient_entry.id,
				supplier: t_supplier.name,
				date: t_ingridient_entry.creation_date,
				document: {
					number: t_entry_document.number,
					issue_date: t_entry_document.issue_date,
					type: t_entry_document.type
				}
			})
			.from(t_ingridient_entry)
			.innerJoin(t_supplier, eq(t_ingridient_entry.supplier_id, t_supplier.id))
			.innerJoin(t_entry_document, eq(t_entry_document.entry_id, t_ingridient_entry.id))
			.limit(5);
		return entries;
	}

	async getCountOfAvailableEntries(input: {
		supplierName?: string;
		page: number;
		documentNumber?: string;
		dateInitial?: string;
		dateFinal?: string;
	}) {
		const entries = await db
			.select({
				value: count(t_ingridient_entry.id)
			})
			.from(t_ingridient_entry)
			.innerJoin(t_supplier, eq(t_ingridient_entry.supplier_id, t_supplier.id))
			.innerJoin(t_entry_document, eq(t_entry_document.entry_id, t_ingridient_entry.id))
			.where(
				and(
					like(t_supplier.name, `${input.supplierName ?? ''}%`),
					like(t_entry_document.number, `${input.documentNumber ?? ''}%`),
					between(
						t_ingridient_entry.creation_date,
						new Date(input.dateInitial ?? '1000-01-01'),
						new Date(input.dateFinal ?? '4000-01-01')
					)
				)
			);
		return entries;
	}
	public PAGE_SIZE = 10;
	async getEntries(input: {
		supplierName?: string;
		page: number;
		documentNumber?: string;
		dateInitial?: string;
		dateFinal?: string;
	}) {
		const entries = await db
			.select({
				id: t_ingridient_entry.id,
				supplier: t_supplier.name,
				date: t_ingridient_entry.creation_date,
				document: {
					number: t_entry_document.number,
					issue_date: t_entry_document.issue_date,
					type: t_entry_document.type
				}
			})
			.from(t_ingridient_entry)
			.innerJoin(t_supplier, eq(t_ingridient_entry.supplier_id, t_supplier.id))
			.innerJoin(t_entry_document, eq(t_entry_document.entry_id, t_ingridient_entry.id))
			.where(
				and(
					like(t_supplier.name, `${input.supplierName ?? ''}%`),
					like(t_entry_document.number, `${input.documentNumber ?? ''}%`),
					between(
						t_ingridient_entry.creation_date,
						new Date(input.dateInitial ?? '1000-01-01'),
						new Date(input.dateFinal ?? '4000-01-01')
					)
				)
			)
			.limit(this.PAGE_SIZE)
			.offset(input.page * this.PAGE_SIZE);
		return entries;
	}

	async getBatchesByEntryId(entry_id: number) {
		return await db
			.select({
				code: t_ingredient_batch.batch_code,
				ingredient: t_ingredient.name,
				initial_amount: t_ingredient_batch.initial_amount,
				bags: t_ingredient_batch.number_of_bags,
				production_date: t_ingredient_batch.production_date,
				expiration_date: t_ingredient_batch.expiration_date,
				cost: t_ingredient_batch.cost,
				withdrawal_tax_amount: t_ingredient_batch.withdrawal_tax_amount,
				iva_tax_percentage: t_ingredient_batch.iva_tax_percentage
			})
			.from(t_ingredient_batch)
			.innerJoin(t_ingredient, eq(t_ingredient.id, t_ingredient_batch.ingredient_id))
			.where(eq(t_ingredient_batch.entry_id, entry_id));
	}

	async deleteEntryById(entry_id: number) {
		const entry = await db
			.select()
			.from(t_ingridient_entry)
			.where(eq(t_ingridient_entry.id, entry_id))
			.then(getFirstIfPosible);

		if (!entry) {
			return logic_error('Entrada no existe');
		}
		try {
			return await db.transaction(async (tx) => {
				await tx.delete(t_ingredient_batch).where(eq(t_ingredient_batch.entry_id, entry_id));
				await tx.delete(t_entry_document).where(eq(t_entry_document.entry_id, entry_id));
				await tx.delete(t_ingridient_entry).where(eq(t_ingridient_entry.id, entry_id));
				return is_ok(null);
			});
		} catch (error) {
			return logic_error(
				'No se puede borrar el ingreso seleccionado porque alguno de los lotes ya fue asignado a una producción'
			);
		}
	}

	private docs = [
		{ id: 1, desc: 'Factura' },
		{ id: 2, desc: 'Remito' },
		{ id: 3, desc: 'Nota de Ingreso' }
	] as const satisfies {
		id: number;
		desc: DocumentType;
	}[];

	getDocumentTypes() {
		return this.docs;
	}

	getDocById(id: number) {
		return this.docs.find((x) => x.id == id);
	}
}
import type { DocumentType } from '$lib/server/db/schema';

export const purchases_service = new IngredientPurchaseService();
