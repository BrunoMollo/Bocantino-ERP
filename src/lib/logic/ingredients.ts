import { db } from '$lib';
import { t_ingredient } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

export const ingredients_ctrl = {
	getAll: () => {
		return db.select().from(t_ingredient);
	},

	getById: (id: number) => {
		return db.select().from(t_ingredient).where(eq(t_ingredient.id, id));
	}
};

