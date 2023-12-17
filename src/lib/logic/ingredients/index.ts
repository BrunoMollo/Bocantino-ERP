import { db } from '$lib';
import { t_ingredient, t_ingredient_batch } from '$lib/server/schema';
import type { TableInsert } from '$lib/utils';
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

export function add(data: Omit<typeof t_ingredient.$inferInsert, 'id'>) {
	return db.insert(t_ingredient).values(data);
}

type BoughtBatch = TableInsert<
	typeof t_ingredient_batch.$inferInsert,
	'id' | 'loss' | 'currency_alpha_code'
>;
type RegisterPurchaseDto = {
	batches: BoughtBatch[];
};

