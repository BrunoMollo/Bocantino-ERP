import { db } from '$lib';
import { t_ingredient } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

export const ingredients_ctrl = {
	getAll: () => {
		return db.select().from(t_ingredient);
	},

	getById: async (id: number) => {
		if (id <= 0) return null;
		const data = await db.select().from(t_ingredient).where(eq(t_ingredient.id, id));
		const first = data[0];
		if (first === undefined) {
			return null;
		} else {
			return first;
		}
	},

	add: (data: Omit<typeof t_ingredient.$inferInsert, 'id'>) => {
		return db.insert(t_ingredient).values(data);
	}
};

