import { db } from '$lib/server/db';
import {
	t_document_type,
	t_entry_document,
	t_ingredient,
	t_ingredient_batch,
	t_ingridient_entry,
	t_product,
	t_supplier,
	tr_ingredient_batch_ingredient_batch,
	tr_ingredient_ingredient,
	tr_ingredient_product,
	tr_supplier_ingredient
} from '$lib/server/db/schema';

export async function __DELETE_ALL_DATABASE() {
	await db.delete(tr_ingredient_product);
	await db.delete(t_product);
	await db.delete(tr_ingredient_batch_ingredient_batch);
	await db.delete(tr_ingredient_ingredient);
	await db.delete(t_ingredient_batch);
	await db.delete(tr_supplier_ingredient);
	await db.delete(t_ingridient_entry);
	await db.delete(t_supplier);
	await db.delete(t_ingredient);
	await db.delete(t_entry_document);
	await db.delete(t_document_type);
}

