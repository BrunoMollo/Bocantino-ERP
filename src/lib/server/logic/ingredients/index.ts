import { db } from '$lib/server/db';
import {
	t_entry_document,
	t_ingredient,
	t_ingredient_batch,
	t_ingridient_entry,
	tr_ingredient_ingredient
} from '$lib/server/db/schema';
import { getFirst, getFirstIfPosible, type Prettify, type TableInsert } from '$lib/utils';
import { eq } from 'drizzle-orm';

export function getAll() {
	return db.select().from(t_ingredient);
}
export async function deletebyID(id: number) {
	return await db.transaction(async (tx) => {
		await tx.delete(tr_ingredient_ingredient).where(eq(tr_ingredient_ingredient.derivedId, id));
		await tx.delete(t_ingredient).where(eq(t_ingredient.id, id));
	});
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

export async function add(
	ingredient: Omit<typeof t_ingredient.$inferInsert, 'id'>,
	source?: { id: number; amount: number }
) {
	return await db.transaction(async (tx) => {
		const insertedIngredient = await tx
			.insert(t_ingredient)
			.values(ingredient)
			.returning({ id: t_ingredient.id })
			.then(getFirst);

		if (source) {
			await tx.insert(tr_ingredient_ingredient).values({
				derivedId: insertedIngredient.id,
				sourceId: source.id,
				amount: source.amount
			});
		}
		return insertedIngredient;
	});
}

export async function edit(
	id: number,
	ingredient: Omit<typeof t_ingredient.$inferInsert, 'id'>,
	source?: { id: number; amount: number } | undefined | null
) {
	return await db.transaction(async (tx) => {
		await tx
			.update(t_ingredient)
			.set({ name: ingredient.name, unit: ingredient.unit, reorderPoint: ingredient.reorderPoint })
			.where(eq(t_ingredient.id, id));
		if (source) {
			const relation = await tx
				.select()
				.from(tr_ingredient_ingredient)
				.where(eq(tr_ingredient_ingredient.derivedId, id))
				.then(getFirstIfPosible);
			if (relation) {
				await tx.update(tr_ingredient_ingredient).set({
					amount: source.amount,
					sourceId: source.id
				});
			} else {
				await tx.insert(tr_ingredient_ingredient).values({
					derivedId: id,
					amount: source.amount,
					sourceId: source.id
				});
			}
		} else if (!source) {
			await db.delete(tr_ingredient_ingredient).where(eq(tr_ingredient_ingredient.derivedId, id));
		}
	});
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

		await tx
			.insert(t_ingridient_entry)
			.values({ totalCost: null, documentId, supplierId: data.supplierId });

		const { supplierId } = data;
		for (let batch of data.batches) {
			await tx.insert(t_ingredient_batch).values({ ...batch, supplierId });
		}
	});
}

export async function getRecipie(id: number) {
	return await db
		.select({
			amount: tr_ingredient_ingredient.amount,
			source: { id: t_ingredient.id, name: t_ingredient.name, unit: t_ingredient.unit }
		})
		.from(tr_ingredient_ingredient)
		.where(eq(tr_ingredient_ingredient.derivedId, id))
		.innerJoin(t_ingredient, eq(tr_ingredient_ingredient.sourceId, t_ingredient.id))
		.then(getFirstIfPosible);
}

