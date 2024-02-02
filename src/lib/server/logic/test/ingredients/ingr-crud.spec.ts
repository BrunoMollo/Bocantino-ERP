import { describe, expect, vi, test, beforeEach } from 'vitest';
import { db } from '$lib/server/db/__mocks__';
import {
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
	// describe.sequential('getAll', () => {
	// 	test('return empty when there are not ingredients', async () => {
	// 		const list = await ingredients_service.getAll();
	// 		expect(list.length).toBe(0);
	// 	});
	// 	test('return one element', async () => {
	// 		await db.insert(t_ingredient).values({ name: 'Banana', unit: 'Kg', reorder_point: 10 });
	// 		const list = await ingredients_service.getAll();
	// 		expect(list.length).toBe(1);
	// 		expect(list[0].name).toBe('Banana');
	// 		expect(list[0].unit).toBe('Kg');
	// 	});
	// 	test('return two element', async () => {
	// 		await db.insert(t_ingredient).values({ name: 'Banana', unit: 'Kg', reorder_point: 10 });
	// 		await db.insert(t_ingredient).values({ name: 'Egg', unit: 'Kg', reorder_point: 100 });
	// 		const list = await ingredients_service.getAll();
	// 		expect(list.length).toBe(2);
	// 		expect(list[0].name).toBe('Banana');
	// 		expect(list[0].unit).toBe('Kg');
	// 		expect(list[1].name).toBe('Egg');
	// 		expect(list[1].unit).toBe('Kg');
	// 	});
	// });
	// describe.sequential('getByID', () => {
	// 	test('return null when there are not ingredients', async () => {
	// 		const data = await ingredients_service.getById(1);
	// 		expect(data).toBe(null);
	// 	});
	// 	test('return element 1 when it exist', async () => {
	// 		await db
	// 			.insert(t_ingredient)
	// 			.values({ id: 1, name: 'Banana', unit: 'Kg', reorder_point: 100 });
	// 		await db.insert(t_ingredient).values({ id: 2, name: 'Egg', unit: 'Kg', reorder_point: 100 });
	// 		const data = await ingredients_service.getById(1);
	//
	// 		expect(data?.id).toBe(1);
	// 		expect(data?.name).toBe('Banana');
	// 		expect(data?.unit).toBe('Kg');
	// 	});
	// 	test('return element 2 when it exist', async () => {
	// 		await db.insert(t_ingredient).values({ name: 'Egg', unit: 'Kg', reorder_point: 300 });
	// 		const banana = await db
	// 			.insert(t_ingredient)
	// 			.values({ name: 'Banana', unit: 'Kg', reorder_point: 200 })
	// 			.returning({ id: t_ingredient.id })
	// 			.then(getFirst);
	// 		const data = await ingredients_service.getById(banana.id);
	//
	// 		expect(data?.id).toBe(banana.id);
	// 		expect(data?.name).toBe('Banana');
	// 		expect(data?.unit).toBe('Kg');
	// 	});
	//
	// 	test('return null when element 2 does not exist', async () => {
	// 		await db
	// 			.insert(t_ingredient)
	// 			.values({ id: 1, name: 'Banana', unit: 'Kg', reorder_point: 100 });
	// 		await db
	// 			.insert(t_ingredient)
	// 			.values({ id: 3, name: 'Water', unit: 'Kg', reorder_point: 100 });
	// 		const data = await ingredients_service.getById(2);
	//
	// 		expect(data).toBe(null);
	// 	});
	// 	test('return null when id is negative, without making db call', async () => {
	// 		const spy_select = vi.spyOn(db, 'select');
	// 		await db
	// 			.insert(t_ingredient)
	// 			.values({ id: 1, name: 'Banana', unit: 'Kg', reorder_point: 100 });
	// 		await db
	// 			.insert(t_ingredient)
	// 			.values({ id: 3, name: 'Water', unit: 'Kg', reorder_point: 200 });
	// 		const data = await ingredients_service.getById(-1);
	//
	// 		expect(spy_select).not.toHaveBeenCalled();
	// 		expect(data).toBe(null);
	// 	});
	//
	// 	test('return null when id is zero, without making db call', async () => {
	// 		const spy_select = vi.spyOn(db, 'select');
	// 		await db.delete(t_ingredient);
	// 		await db
	// 			.insert(t_ingredient)
	// 			.values({ id: 1, name: 'Banana', unit: 'Kg', reorder_point: 200 });
	// 		await db
	// 			.insert(t_ingredient)
	// 			.values({ id: 3, name: 'Water', unit: 'Kg', reorder_point: 200 });
	// 		const data = await ingredients_service.getById(0);
	//
	// 		expect(spy_select).not.toHaveBeenCalled();
	// 		expect(data).toBe(null);
	// 	});
	// });
	//
	// describe.sequential('add', () => {
	// 	test('insert new ingredient', async () => {
	// 		const element = { name: 'Orange', unit: 'Kg' as const, reorder_point: 200 };
	// 		await ingredients_service.add(element);
	// 		const list = await db.select().from(t_ingredient);
	// 		expect(list.length).toBe(1);
	// 		expect(list[0].id).toBeTruthy();
	// 		expect(list[0].name).toBe(element.name);
	// 		expect(list[0].unit).toBe(element.unit);
	// 		expect(list[1]).toBeFalsy();
	// 		const derived = await db.select().from(tr_ingredient_ingredient);
	// 		expect(derived.length).toBe(0);
	// 	});
	// 	test('insert new derived ingredient', async () => {
	// 		await db
	// 			.insert(t_ingredient)
	// 			.values({ id: 100, name: 'Higado', unit: 'Kg', reorder_point: 100 });
	// 		const ingredientPrev = await db.select().from(t_ingredient);
	// 		expect(ingredientPrev.length).toBe(1);
	// 		const inserted = await ingredients_service.add(
	// 			{ name: 'Higado desidratado', unit: 'Kg', reorder_point: 100 },
	// 			{ id: 100, amount: 50 }
	// 		);
	// 		expect(inserted.id).toBeTruthy();
	//
	// 		const listIngredients = await db.select().from(t_ingredient);
	// 		expect(listIngredients.length).toBe(2);
	// 		const derivedRelationsList = await db.select().from(tr_ingredient_ingredient);
	// 		expect(derivedRelationsList.length).toBe(1);
	// 		expect(derivedRelationsList[0].amount).toBe(50);
	// 		expect(derivedRelationsList[0].derived_id).toBe(inserted.id);
	// 		expect(derivedRelationsList[0].source_id).toBe(100);
	// 	});
	// });

	describe.sequential('edit', () => {
		const new_ingr = {
			name: 'Higado desidratado',
			unit: 'gr' as const,
			reorder_point: 10,
			nutrient_fat: 10,
			nutrient_carb: 20,
			nutrient_protein: 30
		};
		let LIVER = { id: 0 };
		let REDUCED_LIVER = { id: 0 };
		let SYNTETIC_LIVER = { id: 0 };
		beforeEach(async () => {
			await db.delete(tr_ingredient_ingredient);
			await db.delete(t_ingredient_batch);
			await db.delete(tr_supplier_ingredient);
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
				nutrient_protein: 30
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
					nutrient_fat: 6
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
				nutrient_fat: 6
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

