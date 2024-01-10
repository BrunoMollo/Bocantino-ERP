import { db } from '$lib/server/db';
import { t_ingredient, t_ingredient_batch, tr_ingredient_ingredient } from '$lib/server/db/schema';
import { getFirst, getFirstIfPosible } from '$lib/utils';
import { and, eq, sql } from 'drizzle-orm';
import { sq_stock } from './ingredient-stock';
import { copy_column, drizzle_map, pick_columns } from 'drizzle-tools';

export function getAll() {
	return db.select().from(t_ingredient);
}

export async function getAllWithStock() {
	return await db
		.with(sq_stock)
		.select({
			ingredient: pick_columns(t_ingredient, ['id', 'name', 'unit', 'reorderPoint']),
			stock: {
				stock: sql<number>`COALESCE(sum(${sq_stock.currently_available}), 0)`
			}
		})
		.from(t_ingredient)
		.leftJoin(
			t_ingredient_batch,
			and(
				eq(t_ingredient_batch.ingredientId, t_ingredient.id),
				eq(t_ingredient_batch.state, 'AVAILABLE')
			)
		)
		.leftJoin(sq_stock, eq(sq_stock.batch_id, t_ingredient_batch.id))
		.groupBy(t_ingredient.id)
		.then(copy_column({ from: 'stock', field: 'stock', to: 'ingredient' }))
		.then(drizzle_map({ one: 'ingredient', with_one: [], with_many: [] }));
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
			await tx.delete(tr_ingredient_ingredient).where(eq(tr_ingredient_ingredient.derivedId, id));
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

