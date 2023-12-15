import { db } from '$lib';
import { t_ingredient } from '$lib/server/schema';

export async function getAllIngredients() {
	return await db.select().from(t_ingredient);
}

