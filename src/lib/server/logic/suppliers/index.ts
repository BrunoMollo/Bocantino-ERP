import { db } from '$lib/server/db';
import { t_supplier } from '$lib/server/db/schema';

export function getAll() {
	return db.select().from(t_supplier);
}

