import { db } from '$lib/server/db';
import {
	t_document_type,
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

export async function __DELETE_ALL_DATABASE() {
	await db.transaction(async (tx) => {
		await tx.delete(tr_product_batch_ingredient_batch);
		await tx.delete(t_product_batch);
		await tx.delete(tr_ingredient_batch_ingredient_batch);
		await tx.delete(t_ingredient_batch);
		await tx.delete(t_ingridient_entry);
		await tx.delete(t_entry_document);
		await tx.delete(tr_supplier_ingredient);
		await tx.delete(t_supplier);
		await tx.delete(tr_ingredient_product);
		await tx.delete(t_product);
		await tx.delete(tr_ingredient_ingredient);
		await tx.delete(t_ingredient);
		await tx.delete(t_document_type);
	});
}

// Helper function to create ingredient test data with all required fields
export function createIngredientTestData(overrides: Partial<{
	id?: number;
	name: string;
	unit: 'gr' | 'Kg';
	reorder_point: number;
}> = {}) {
	return {
		name: 'Test Ingredient',
		unit: 'Kg' as const,
		reorder_point: 100,
		nutrient_protein: 0,
		nutrient_carb: 0,
		nutrient_fat: 0,
		nutrient_humidity: 0,
		nutrient_fiber: 0,
		nutrient_ashes: 0,
		nutrient_calcium: 0,
		nutrient_sodium: 0,
		nutrient_phosphorus: 0,
		...overrides
	};
}

