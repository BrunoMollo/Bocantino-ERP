import { db } from '$lib/server/db';
import {
	t_entry_document,
	t_ingredient,
	t_ingredient_batch,
	t_ingridient_entry,
	t_product,
	t_product_batch,
	t_supplier,
	tr_ingredient_batch_ingredient_batch,
	tr_ingredient_ingredient,
	tr_ingredient_product,
	tr_product_batch_ingredient_batch,
	tr_supplier_ingredient
} from '$lib/server/db/schema';
import { expect } from 'vitest';

export async function __DELETE_ALL_DATABASE() {
	await db.transaction(async (tx) => {
		await tx.delete(tr_product_batch_ingredient_batch);
		await tx.delete(t_product_batch);
		await tx.delete(tr_ingredient_batch_ingredient_batch);
		await tx.delete(t_ingredient_batch);
		await tx.delete(t_entry_document);
		await tx.delete(t_ingridient_entry);
		await tx.delete(tr_supplier_ingredient);
		await tx.delete(t_supplier);
		await tx.delete(tr_ingredient_product);
		await tx.delete(t_product);
		await tx.delete(tr_ingredient_ingredient);
		await tx.delete(t_ingredient);
	});
}

/*
 * Just a helper for testing, ignores the time
 * */
export function compare_just_dates(date1: Date | null, date2: Date | null) {
	const x = date1?.toISOString().split('T')[0];
	const y = date2?.toISOString().split('T')[0];
	expect(x).toBe(y);
}
