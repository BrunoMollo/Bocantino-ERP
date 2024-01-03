import { getFirst, type Prettify, type TableInsert } from '$lib/utils';
import {
	t_document_type,
	t_entry_document,
	t_ingredient,
	t_ingredient_batch,
	t_ingridient_entry,
	t_supplier
} from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { eq, like } from 'drizzle-orm';

export type RegisterPurchaseDto = Prettify<{
	supplierId: number;
	document: TableInsert<typeof t_entry_document.$inferInsert, 'id'>;
	batches: {
		ingredientId: number;
		batch_code: string;
		initialAmount: number;
		productionDate: Date;
		expirationDate: Date;
		numberOfBags: number;
		cost: number;
	}[];
}>;
export function registerBoughtIngrediets(data: RegisterPurchaseDto) {
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

		const { supplierId } = data;
		const batchesId = [] as number[];
		for (let batch of data.batches) {
			const inserted = await tx
				.insert(t_ingredient_batch)
				.values({ ...batch, supplierId, state: 'AVAILABLE', entry_id })
				.returning({ id: t_ingredient_batch.id })
				.then(getFirst);
			batchesId.push(inserted.id);
		}
		return { entry_id, batchesId };
	});
}

export async function getEntries(input: { supplierName?: string; pageSize: number; page: number }) {
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
		.where(like(t_supplier.name, `${input.supplierName ?? ''}%`))
		.limit(input.pageSize)
		.offset(input.page * input.pageSize);
	return entries;
}

export async function getBatchesByEntryId(entry_id: number) {
	return await db
		.select({
			code: t_ingredient_batch.batch_code,
			ingredient: t_ingredient.name,
			initialAmount: t_ingredient_batch.initialAmount,
			bags: t_ingredient_batch.numberOfBags,
			productionDate: t_ingredient_batch.productionDate,
			expirationDate: t_ingredient_batch.expirationDate,
			cost: t_ingredient_batch.cost
		})
		.from(t_ingredient_batch)
		.innerJoin(t_ingredient, eq(t_ingredient.id, t_ingredient_batch.ingredientId))
		.where(eq(t_ingredient_batch.entry_id, entry_id));
}

