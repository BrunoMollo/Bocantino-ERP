import { db } from '$lib/server/db';
import {
	t_entry_document,
	t_ingredient,
	t_ingredient_batch,
	t_ingridient_entry
} from '$lib/server/db/schema';
import { getFirst, type Prettify, type TableInsert } from '$lib/utils';
import { eq } from 'drizzle-orm';

export function getAll() {
	return db.select().from(t_ingredient);
}

export async function getById(id: number) {
	if (id <= 0) return null;
	const data = await db.select().from(t_ingredient).where(eq(t_ingredient.id, id));
	const first = data[0];
	if (first === undefined) {
		return null;
	} else {
		return first;
	}
}

export async function add(data: Omit<typeof t_ingredient.$inferInsert, 'id'>) {
	const x = await db.insert(t_ingredient).values(data).returning({ id: t_ingredient.id });
	return getFirst(x);
}

type BoughtBatch = TableInsert<
	typeof t_ingredient_batch.$inferInsert,
	'id' | 'loss' | 'currency_alpha_code' | 'supplierId'
>;
export type RegisterPurchaseDto = Prettify<{
	supplierId: number;
	document: TableInsert<typeof t_entry_document.$inferInsert, 'id'>;
	batches: BoughtBatch[];
}>;
export function registerBoughtIngrediets(data: RegisterPurchaseDto) {
	return db.transaction(async (tx: any) => {
		const { documentId } = await tx
			.insert(t_entry_document)
			.values(data.document)
			.returning({ documentId: t_entry_document.id })
			.then(getFirst);

		await tx.insert(t_ingridient_entry).values({ totalCost: null, documentId });

		const { supplierId } = data;
		for (let batch of data.batches) {
			await tx.insert(t_ingredient_batch).values({ ...batch, supplierId });
		}
	});
}
