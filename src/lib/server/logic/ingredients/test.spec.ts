import { describe, expect, vi, test, beforeEach, beforeAll } from 'vitest';
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
import { ingredients_service } from '$logic';
import { getFirst } from '$lib/utils';

vi.mock('$lib/server/db/index.ts');

describe('ingredients crud', () => {
	beforeEach(async () => {
		await db.delete(tr_ingredient_ingredient);
		await db.delete(t_ingredient_batch);
		await db.delete(tr_supplier_ingredient);
		await db.delete(t_ingridient_entry);
		await db.delete(t_supplier);
		await db.delete(t_ingredient);
	});
	describe('getAll', () => {
		test('return empty when there are not ingredients', async () => {
			const list = await ingredients_service.getAll();
			expect(list.length).toBe(0);
		});
		test('return one element', async () => {
			await db
				.insert(t_ingredient)
				.values({ name: 'Banana', unit: 'Kilogramos', reorderPoint: 10 });
			const list = await ingredients_service.getAll();
			expect(list.length).toBe(1);
			expect(list[0].name).toBe('Banana');
			expect(list[0].unit).toBe('Kilogramos');
		});
		test('return two element', async () => {
			await db
				.insert(t_ingredient)
				.values({ name: 'Banana', unit: 'Kilogramos', reorderPoint: 10 });
			await db.insert(t_ingredient).values({ name: 'Egg', unit: 'Kilogramos', reorderPoint: 100 });
			const list = await ingredients_service.getAll();
			expect(list.length).toBe(2);
			expect(list[0].name).toBe('Banana');
			expect(list[0].unit).toBe('Kilogramos');
			expect(list[1].name).toBe('Egg');
			expect(list[1].unit).toBe('Kilogramos');
		});
	});
	describe('getByID', () => {
		test('return null when there are not ingredients', async () => {
			const data = await ingredients_service.getById(1);
			expect(data).toBe(null);
		});
		test('return element 1 when it exist', async () => {
			await db
				.insert(t_ingredient)
				.values({ id: 1, name: 'Banana', unit: 'Kilogramos', reorderPoint: 100 });
			await db
				.insert(t_ingredient)
				.values({ id: 2, name: 'Egg', unit: 'Kilogramos', reorderPoint: 100 });
			const data = await ingredients_service.getById(1);

			expect(data?.id).toBe(1);
			expect(data?.name).toBe('Banana');
			expect(data?.unit).toBe('Kilogramos');
		});
		test('return element 2 when it exist', async () => {
			await db.insert(t_ingredient).values({ name: 'Egg', unit: 'Kilogramos', reorderPoint: 300 });
			const banana = await db
				.insert(t_ingredient)
				.values({ name: 'Banana', unit: 'Kilogramos', reorderPoint: 200 })
				.returning({ id: t_ingredient.id })
				.then(getFirst);
			const data = await ingredients_service.getById(banana.id);

			expect(data?.id).toBe(banana.id);
			expect(data?.name).toBe('Banana');
			expect(data?.unit).toBe('Kilogramos');
		});

		test('return null when element 2 does not exist', async () => {
			await db
				.insert(t_ingredient)
				.values({ id: 1, name: 'Banana', unit: 'Kilogramos', reorderPoint: 100 });
			await db
				.insert(t_ingredient)
				.values({ id: 3, name: 'Water', unit: 'Kilogramos', reorderPoint: 100 });
			const data = await ingredients_service.getById(2);

			expect(data).toBe(null);
		});
		test('return null when id is negative, without making db call', async () => {
			const spy_select = vi.spyOn(db, 'select');
			await db
				.insert(t_ingredient)
				.values({ id: 1, name: 'Banana', unit: 'Kilogramos', reorderPoint: 100 });
			await db
				.insert(t_ingredient)
				.values({ id: 3, name: 'Water', unit: 'Kilogramos', reorderPoint: 200 });
			const data = await ingredients_service.getById(-1);

			expect(spy_select).not.toHaveBeenCalled();
			expect(data).toBe(null);
		});

		test('return null when id is zero, without making db call', async () => {
			const spy_select = vi.spyOn(db, 'select');
			await db.delete(t_ingredient);
			await db
				.insert(t_ingredient)
				.values({ id: 1, name: 'Banana', unit: 'Kilogramos', reorderPoint: 200 });
			await db
				.insert(t_ingredient)
				.values({ id: 3, name: 'Water', unit: 'Kilogramos', reorderPoint: 200 });
			const data = await ingredients_service.getById(0);

			expect(spy_select).not.toHaveBeenCalled();
			expect(data).toBe(null);
		});
	});

	describe('add', () => {
		test('insert new ingredient', async () => {
			const element = { name: 'Orange', unit: 'Kilogramos' as const, reorderPoint: 200 };
			await ingredients_service.add(element);
			const list = await db.select().from(t_ingredient);
			expect(list.length).toBe(1);
			expect(list[0].id).toBeTruthy();
			expect(list[0].name).toBe(element.name);
			expect(list[0].unit).toBe(element.unit);
			expect(list[1]).toBeFalsy();
			const derived = await db.select().from(tr_ingredient_ingredient);
			expect(derived.length).toBe(0);
		});
		test('insert new derived ingredient', async () => {
			await db
				.insert(t_ingredient)
				.values({ id: 100, name: 'Higado', unit: 'Kilogramos', reorderPoint: 100 });
			const ingredientPrev = await db.select().from(t_ingredient);
			expect(ingredientPrev.length).toBe(1);
			const inserted = await ingredients_service.add(
				{ name: 'Higado desidratado', unit: 'Kilogramos', reorderPoint: 100 },
				{ id: 100, amount: 50 }
			);
			expect(inserted.id).toBeTruthy();

			const listIngredients = await db.select().from(t_ingredient);
			expect(listIngredients.length).toBe(2);
			const derivedRelationsList = await db.select().from(tr_ingredient_ingredient);
			expect(derivedRelationsList.length).toBe(1);
			expect(derivedRelationsList[0].amount).toBe(50);
			expect(derivedRelationsList[0].derivedId).toBe(inserted.id);
			expect(derivedRelationsList[0].sourceId).toBe(100);
		});
	});

	describe('edit', () => {
		let LIVER = { id: 0 };
		let REDUCED_LIVER = { id: 0 };
		let SYNTETIC_LIVER = { id: 0 };
		beforeEach(async () => {
			await db.delete(tr_ingredient_ingredient);
			await db.delete(t_ingredient);
			LIVER = await ingredients_service.add({
				name: 'Higado',
				unit: 'Kilogramos',
				reorderPoint: 200
			});
			REDUCED_LIVER = await ingredients_service.add(
				{
					name: 'Higado desidratado',
					unit: 'Kilogramos',
					reorderPoint: 100
				},
				{ id: LIVER.id, amount: 0.5 }
			);
			SYNTETIC_LIVER = await ingredients_service.add({
				name: 'Higado sintetico',
				unit: 'Kilogramos',
				reorderPoint: 20
			});
		});

		test('change non derived ingredietn', async () => {
			await ingredients_service.edit(LIVER.id, {
				name: 'Higado editado',
				unit: 'Gramos',
				reorderPoint: 10
			});
			const edited = await db.query.t_ingredient.findFirst({
				where: eq(t_ingredient.id, LIVER.id)
			});
			expect(edited).toBeTruthy();
			expect(edited?.name).toBe('Higado editado');
			expect(edited?.unit).toBe('Gramos');
			expect(edited?.reorderPoint).toBe(10);
		});

		test('change derived ingredient relation', async () => {
			await ingredients_service.edit(
				REDUCED_LIVER.id,
				{
					name: 'Higado desidratado',
					unit: 'Kilogramos',
					reorderPoint: 10
				},
				{ id: SYNTETIC_LIVER.id, amount: 0.2 }
			);
			const edited = await db.query.t_ingredient.findFirst({
				where: eq(t_ingredient.id, REDUCED_LIVER.id)
			});
			expect(edited).toBeTruthy();
			expect(edited?.name).toBe('Higado desidratado');
			expect(edited?.unit).toBe('Kilogramos');
			expect(edited?.reorderPoint).toBe(10);
			const relations = await db.select().from(tr_ingredient_ingredient);
			expect(relations.length).toBe(1);
			expect(relations[0]).toBeTruthy();
			expect(relations[0]?.amount).toBe(0.2);
			expect(relations[0]?.sourceId).toBe(SYNTETIC_LIVER.id);
		});

		test('change change non derived to derived', async () => {
			const relations_prev = await db.select().from(tr_ingredient_ingredient);
			expect(relations_prev.length).toBe(1);
			await ingredients_service.edit(
				SYNTETIC_LIVER.id,
				{
					name: 'Higado syntetico',
					unit: 'Kilogramos',
					reorderPoint: 10
				},
				{ id: LIVER.id, amount: 0.1 }
			);
			const edited = await db.query.t_ingredient.findFirst({
				where: eq(t_ingredient.id, SYNTETIC_LIVER.id)
			});
			expect(edited).toBeTruthy();
			expect(edited?.name).toBe('Higado syntetico');
			expect(edited?.unit).toBe('Kilogramos');
			expect(edited?.reorderPoint).toBe(10);
			const relations = await db.select().from(tr_ingredient_ingredient);
			expect(relations.length).toBe(2);
			const relation = await db
				.select()
				.from(tr_ingredient_ingredient)
				.where(eq(tr_ingredient_ingredient.derivedId, SYNTETIC_LIVER.id));

			expect(relation.length).toBe(1);
			expect(relation[0]).toBeTruthy();
			expect(relation[0].derivedId).toBe(SYNTETIC_LIVER.id);
			expect(relation[0].sourceId).toBe(LIVER.id);
			expect(relation[0].amount).toBe(0.1);
		});

		test('change change derived to not derived', async () => {
			await ingredients_service.add(
				{
					name: 'Really Higado desidratado',
					unit: 'Kilogramos',
					reorderPoint: 120
				},
				{ id: LIVER.id, amount: 0.9 }
			);
			const relations_prev = await db.select().from(tr_ingredient_ingredient);
			expect(relations_prev.length).toBe(2);
			await ingredients_service.edit(REDUCED_LIVER.id, {
				name: 'Higado reducido',
				unit: 'Kilogramos',
				reorderPoint: 10
			});
			const edited = await db.query.t_ingredient.findFirst({
				where: eq(t_ingredient.id, REDUCED_LIVER.id)
			});
			expect(edited).toBeTruthy();
			expect(edited?.name).toBe('Higado reducido');
			expect(edited?.unit).toBe('Kilogramos');
			expect(edited?.reorderPoint).toBe(10);
			const relations = await db.select().from(tr_ingredient_ingredient);
			expect(relations.length).toBe(1);
		});
	});
});

