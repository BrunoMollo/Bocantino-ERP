import { getFirst, type TableInsert } from '$lib/utils';
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

export class IngredientPurchaseService {
	registerBoughtIngrediets(data: {
		supplierId: number;
		document: TableInsert<typeof t_entry_document.$inferInsert, 'id'>;
		perceptions_tax: number;
		iva_tax: number;
		batches: {
			ingredientId: number;
			batch_code: string;
			initialAmount: number;
			productionDate: Date;
			expiration_date: Date;
			numberOfBags: number;
			cost: number;
		}[];
	}) {
		return db.transaction(async (tx) => {
			const { documentId } = await tx
				.insert(t_entry_document)
				.values(data.document)
				.returning({ documentId: t_entry_document.id })
				.then(getFirst);

			const { entry_id } = await tx
				.insert(t_ingridient_entry)
				.values({ totalCost: null, documentId, supplierId: data.supplierId })
				.returning({ entry_id: t_ingridient_entry.id })
				.then(getFirst);

			const { supplierId, iva_tax, perceptions_tax } = data;
			const batchesId = [] as number[];
			for (let batch of data.batches) {
				const inserted = await tx
					.insert(t_ingredient_batch)
					.values({ ...batch, supplierId, state: 'AVAILABLE', entry_id, iva_tax, perceptions_tax })
					.returning({ id: t_ingredient_batch.id })
					.then(getFirst);
				batchesId.push(inserted.id);
			}
			return { entry_id, batchesId };
		});
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
			.innerJoin(t_supplier, eq(t_ingridient_entry.supplierId, t_supplier.id))
			.innerJoin(t_entry_document, eq(t_entry_document.id, t_ingridient_entry.documentId))
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
				initialAmount: t_ingredient_batch.initialAmount,
				bags: t_ingredient_batch.numberOfBags,
				productionDate: t_ingredient_batch.productionDate,
				expiration_date: t_ingredient_batch.expiration_date,
				cost: t_ingredient_batch.cost
			})
			.from(t_ingredient_batch)
			.innerJoin(t_ingredient, eq(t_ingredient.id, t_ingredient_batch.ingredientId))
			.where(eq(t_ingredient_batch.entry_id, entry_id));
	}
}

export const purchases_service = new IngredientPurchaseService();

