import { getFirst, getFirstIfPosible, type TableInsert } from '$lib/utils';
import {
	t_document_type,
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

type BuyIngredients_Dto = {
	supplier_id: number;
	document: TableInsert<typeof t_entry_document.$inferInsert, 'id' | 'entry_id'>;
	withdrawal_tax_amount: number;
	iva_tax_percentage: number;
	batches: {
		ingredient_id: number;
		batch_code: string;
		initial_amount: number;
		production_date: Date;
		expiration_date: Date;
		number_of_bags: number;
		cost: number;
	}[];
};
export class IngredientPurchaseService {
	async getEntryById(entry_id: number) {
		return await db
			.select({
				id: t_ingridient_entry.id,
				supplier: t_supplier.name,
				date: t_ingridient_entry.creation_date,
				document: pick_merge()
					.table(t_entry_document, 'number', 'issue_date')
					.aliased(t_document_type, 'desc', 'type')
					.build()
			})
			.from(t_ingridient_entry)
			.innerJoin(t_supplier, eq(t_supplier.id, t_ingridient_entry.supplier_id))
			.innerJoin(t_entry_document, eq(t_entry_document.entry_id, t_ingridient_entry.id))
			.innerJoin(t_document_type, eq(t_document_type.id, t_entry_document.typeId))
			.where(eq(t_ingridient_entry.id, entry_id))
			.then(getFirstIfPosible);
	}

	async findDocumentTypeName(id: number) {
		const type = await db
			.select()
			.from(t_document_type)
			.where(eq(t_document_type.id, id))
			.then(getFirstIfPosible);
		return type?.desc;
	}

	async buyIngredientsBasedOnDocuemntType(data: BuyIngredients_Dto) {
		const doc_desc = await purchases_service.findDocumentTypeName(data.document.typeId);
		switch (doc_desc) {
			case 'Factura':
				return await this.buyIngredients_Factura(data);
			case 'Remito':
				return logic_error('TIPO DE DOCUMENTO NO IMPLMENTADO');
			case 'Nota de Ingreso':
				return logic_error('TIPO DE DOCUMENTO NO IMPLMENTADO');
			case undefined:
				return logic_error('Tipo de documento no especificado');
			default:
				return logic_error('Tipo de documento no especificado (should_not_reach)');
		}
	}

	async buyIngredients_Factura(data: BuyIngredients_Dto) {
		const doc_type_name = await this.findDocumentTypeName(data.document.typeId);
		if (doc_type_name !== 'Factura') return logic_error('No es un ingreso por factura');

		if (!data.iva_tax_percentage) return logic_error('Falta IVA');
		if (!data.withdrawal_tax_amount) return logic_error('Falta percepciones');
		if (!data.document.number) return logic_error('Falta numero de Factura');
		if (!data.document.issue_date) return logic_error('Falta fecha de emision de Factura');
		if (!data.document.due_date) return logic_error('Falta fecha de vencimiento de Factura');
		if (data.batches.some((x) => !x.cost)) return logic_error('Falta el costo de un lote');

		const returned = await this.registerBoughtIngrediets(data);
		return is_ok(returned);
	}

	registerBoughtIngrediets(data: BuyIngredients_Dto) {
		return db.transaction(async (tx) => {
			const { entry_id } = await tx
				.insert(t_ingridient_entry)
				.values({ total_cost: null, supplier_id: data.supplier_id })
				.returning({ entry_id: t_ingridient_entry.id })
				.then(getFirst);

			await tx
				.insert(t_entry_document)
				.values({ ...data.document, entry_id })
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

	public async getLastEntries() {
		const entries = await db
			.select({
				id: t_ingridient_entry.id,
				supplier: t_supplier.name,
				date: t_ingridient_entry.creation_date,
				document: {
					number: t_entry_document.number,
					issue_date: t_entry_document.issue_date,
					type: t_document_type.desc
				}
			})
			.from(t_ingridient_entry)
			.innerJoin(t_supplier, eq(t_ingridient_entry.supplier_id, t_supplier.id))
			.innerJoin(t_entry_document, eq(t_entry_document.entry_id, t_ingridient_entry.id))
			.innerJoin(t_document_type, eq(t_entry_document.typeId, t_document_type.id))
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
			.innerJoin(t_document_type, eq(t_entry_document.typeId, t_document_type.id))
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
					type: t_document_type.desc
				}
			})
			.from(t_ingridient_entry)
			.innerJoin(t_supplier, eq(t_ingridient_entry.supplier_id, t_supplier.id))
			.innerJoin(t_entry_document, eq(t_entry_document.entry_id, t_ingridient_entry.id))
			.innerJoin(t_document_type, eq(t_entry_document.typeId, t_document_type.id))
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
		try {
			await db.delete(t_ingredient_batch).where(eq(t_ingredient_batch.entry_id, entry_id));

			await db.delete(t_entry_document).where(eq(t_entry_document.entry_id, entry_id));

			await db.delete(t_ingridient_entry).where(eq(t_ingridient_entry.id, entry_id));
			return is_ok(null);
		} catch (error) {
			return logic_error(
				'No se puede borrar el ingreso seleccionado porque alguno de los lotes ya fue asignado a una producción'
			);
		}
	}
}

export const purchases_service = new IngredientPurchaseService();
