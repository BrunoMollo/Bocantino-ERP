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
import { and, eq, like } from 'drizzle-orm';
import { pick_merge } from 'drizzle-tools/src/pick-columns';

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
			.innerJoin(t_entry_document, eq(t_entry_document.id, t_ingridient_entry.document_id))
			.innerJoin(t_document_type, eq(t_document_type.id, t_entry_document.typeId))
			.where(eq(t_ingridient_entry.id, entry_id))
			.then(getFirstIfPosible);
	}
	registerBoughtIngrediets(data: {
		supplier_id: number;
		document: TableInsert<typeof t_entry_document.$inferInsert, 'id'>;
		perceptions_tax_amount: number;
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
	}) {
		return db().transaction(async (tx) => {
			const { document_id } = await tx
				.insert(t_entry_document)
				.values(data.document)
				.returning({ document_id: t_entry_document.id })
				.then(getFirst);

			const { entry_id } = await tx
				.insert(t_ingridient_entry)
				.values({ total_cost: null, document_id, supplier_id: data.supplier_id })
				.returning({ entry_id: t_ingridient_entry.id })
				.then(getFirst);

			const { supplier_id, iva_tax_percentage, perceptions_tax_amount } = data;
			const batchesId = [] as number[];
			for (let batch of data.batches) {
				const inserted = await tx
					.insert(t_ingredient_batch)
					.values({
						...batch,
						supplier_id,
						state: 'AVAILABLE',
						entry_id,
						iva_tax_percentage,
						perceptions_tax_amount
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
			.innerJoin(t_entry_document, eq(t_entry_document.id, t_ingridient_entry.document_id))
			.innerJoin(t_document_type, eq(t_entry_document.typeId, t_document_type.id))
			.limit(5);
		return entries;
	}

	async getEntries(input: {
		supplierName?: string;
		pageSize: number;
		page: number;
		documentNumber?: string;
		dateInitial?: Date;
		dateFinal?: Date;
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
			.innerJoin(t_entry_document, eq(t_entry_document.id, t_ingridient_entry.document_id))
			.innerJoin(t_document_type, eq(t_entry_document.typeId, t_document_type.id))
			.where(
				and(
					like(t_supplier.name, `${input.supplierName ?? ''}%`),
					like(t_entry_document.number, `${input.documentNumber ?? ''}%`)
				)
			)
			.limit(input.pageSize)
			.offset(input.page * input.pageSize);
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
				cost: t_ingredient_batch.cost
			})
			.from(t_ingredient_batch)
			.innerJoin(t_ingredient, eq(t_ingredient.id, t_ingredient_batch.ingredient_id))
			.where(eq(t_ingredient_batch.entry_id, entry_id));
	}
}

export const purchases_service = new IngredientPurchaseService();

