import { db } from '$lib';
import { t_supplier } from '$lib/server/schema';

export function getAll() {
	return db.select().from(t_supplier);
}

