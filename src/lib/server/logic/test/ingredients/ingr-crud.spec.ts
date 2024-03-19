import { describe, expect, vi, test, beforeEach } from 'vitest';
import { db } from '$lib/server/db/__mocks__';
import {
	t_entry_document,
	t_ingredient,
	t_ingredient_batch,
	t_ingridient_entry,
	t_supplier,
	tr_ingredient_ingredient,
	tr_supplier_ingredient
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getFirst } from '$lib/utils';
import { __DELETE_ALL_DATABASE } from '../utils';
import { ingredients_service } from '$logic/ingredient-service';
import { ingredient_defaulter_service } from '$logic/defaulters/ingredient-service.default';

vi.mock('$lib/server/db/index.ts');

describe.sequential('ingredients crud', () => {
	beforeEach(async () => {
		await __DELETE_ALL_DATABASE();
	});

	describe.sequential('edit', () => {
		const new_ingr = {
			name: 'Higado desidratado',
			unit: 'gr' as const,
			reorder_point: 10,
			nutrient_fat: 10,
			nutrient_carb: 20,
			nutrient_protein: 30,
			nutrient_ashes: 0,
			nutrient_fiber: 0,
			nutrient_calcium: 0,
			nutrient_sodium: 0,
			nutrient_humidity: 0,
			nutrient_phosphorus: 0
		};
		let LIVER = { id: 0 };
		let REDUCED_LIVER = { id: 0 };
		let SYNTETIC_LIVER = { id: 0 };
		beforeEach(async () => {
			await db.delete(tr_ingredient_ingredient);
			await db.delete(t_ingredient_batch);
			await db.delete(tr_supplier_ingredient);
			await db.delete(t_entry_document);
			await db.delete(t_ingridient_entry);
			await db.delete(t_supplier);
			await db.delete(t_ingredient);
			LIVER = { id: await ingredient_defaulter_service.add_simple() };
			REDUCED_LIVER = {
				id: await ingredient_defaulter_service.add_derived({ from: LIVER.id, amount: 0.5 })
			};
			SYNTETIC_LIVER = { id: await ingredient_defaulter_service.add_simple() };
		});

		test('change non derived ingredietn', async () => {
			const new_ingr = {
				name: 'Higado editado',
				unit: 'gr' as const,
				reorder_point: 10,
				nutrient_fat: 10,
				nutrient_carb: 20,
				nutrient_protein: 30,
				nutrient_ashes: 0,
				nutrient_fiber: 0,
				nutrient_calcium: 0,
				nutrient_sodium: 0,
				nutrient_humidity: 0,
				nutrient_phosphorus: 0
			};
			await ingredients_service.edit(LIVER.id, new_ingr);
			const edited = await db
				.select()
				.from(t_ingredient)
				.where(eq(t_ingredient.id, LIVER.id))
				.then(getFirst);
			expect(edited).toEqual({ id: edited.id, ...new_ingr });
		});

		test('change derived ingredient relation', async () => {
			await ingredients_service.edit(REDUCED_LIVER.id, new_ingr, {
				id: SYNTETIC_LIVER.id,
				amount: 0.2
			});
			const edited = await db
				.select()
				.from(t_ingredient)
				.where(eq(t_ingredient.id, REDUCED_LIVER.id))
				.then(getFirst);
			expect(edited).toEqual({ id: edited.id, ...new_ingr });

			const relations = await db.select().from(tr_ingredient_ingredient);
			expect(relations.length).toBe(1);
			expect(relations[0]).toBeTruthy();
			expect(relations[0]?.amount).toBe(0.2);
			expect(relations[0]?.source_id).toBe(SYNTETIC_LIVER.id);
		});

		test('change change non derived to derived', async () => {
			const relations_prev = await db.select().from(tr_ingredient_ingredient);
			expect(relations_prev.length).toBe(1);
			await ingredients_service.edit(SYNTETIC_LIVER.id, new_ingr, { id: LIVER.id, amount: 0.1 });
			const edited = await db
				.select()
				.from(t_ingredient)
				.where(eq(t_ingredient.id, SYNTETIC_LIVER.id))
				.then(getFirst);

			expect(edited).toEqual({ id: edited.id, ...new_ingr });

			const relations = await db.select().from(tr_ingredient_ingredient);
			expect(relations.length).toBe(2);
			const relation = await db
				.select()
				.from(tr_ingredient_ingredient)
				.where(eq(tr_ingredient_ingredient.derived_id, SYNTETIC_LIVER.id));

			expect(relation.length).toBe(1);
			expect(relation[0]).toBeTruthy();
			expect(relation[0].derived_id).toBe(SYNTETIC_LIVER.id);
			expect(relation[0].source_id).toBe(LIVER.id);
			expect(relation[0].amount).toBe(0.1);
		});

		test('change change derived to not derived', async () => {
			await ingredients_service.add(
				{
					name: 'Really Higado desidratado',
					unit: 'Kg',
					reorder_point: 120,
					nutrient_protein: 5,
					nutrient_carb: 5,
					nutrient_fat: 6,
					nutrient_ashes: 0,
					nutrient_fiber: 0,
					nutrient_calcium: 0,
					nutrient_sodium: 0,
					nutrient_humidity: 0,
					nutrient_phosphorus: 0
				},
				{ id: LIVER.id, amount: 0.9 }
			);
			const relations_prev = await db.select().from(tr_ingredient_ingredient);
			expect(relations_prev.length).toBe(2);
			await ingredients_service.edit(REDUCED_LIVER.id, {
				name: 'Higado reducido',
				unit: 'Kg',
				reorder_point: 10,
				nutrient_protein: 5,
				nutrient_carb: 5,
				nutrient_fat: 6,
				nutrient_ashes: 0,
				nutrient_fiber: 0,
				nutrient_calcium: 0,
				nutrient_sodium: 0,
				nutrient_humidity: 0,
				nutrient_phosphorus: 0
			});
			const edited = await db
				.select()
				.from(t_ingredient)
				.where(eq(t_ingredient.id, REDUCED_LIVER.id))
				.then(getFirst);
			expect(edited).toBeTruthy();
			expect(edited?.name).toBe('Higado reducido');
			expect(edited?.unit).toBe('Kg');
			expect(edited?.reorder_point).toBe(10);
			const relations = await db.select().from(tr_ingredient_ingredient);
			expect(relations.length).toBe(1);
		});
	});
});
