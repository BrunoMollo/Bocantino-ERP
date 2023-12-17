import { describe, it, expect, vi } from 'vitest';
import * as ingredients_ctrl from '.';
import { db } from '$lib/__mocks__/index';
import { t_ingredient } from '$lib/server/schema';

vi.mock('$lib/index');

describe('ingredients logic', () => {
	describe('getAll', () => {
		it('return empty when there are not ingredients', async () => {
			await db.delete(t_ingredient);
			const list = await ingredients_ctrl.getAll();
			expect(list.length).toBe(0);
		});
		it('return one element', async () => {
			await db.delete(t_ingredient);
			await db.insert(t_ingredient).values({ name: 'Banana', unit: 'Kg' });
			const list = await ingredients_ctrl.getAll();
			expect(list.length).toBe(1);
			expect(list[0].name).toBe('Banana');
			expect(list[0].unit).toBe('Kg');
		});
		it('return two element', async () => {
			await db.delete(t_ingredient);
			await db.insert(t_ingredient).values({ name: 'Banana', unit: 'Kg' });
			await db.insert(t_ingredient).values({ name: 'Egg', unit: 'Kg' });
			const list = await ingredients_ctrl.getAll();
			expect(list.length).toBe(2);
			expect(list[0].name).toBe('Banana');
			expect(list[0].unit).toBe('Kg');
			expect(list[1].name).toBe('Egg');
			expect(list[1].unit).toBe('Kg');
		});
	});
	describe('getByID', () => {
		it('return null when there are not ingredients', async () => {
			await db.delete(t_ingredient);
			const data = await ingredients_ctrl.getById(1);
			expect(data).toBe(null);
		});
		it('return element 1 when it exist', async () => {
			await db.delete(t_ingredient);
			await db.insert(t_ingredient).values({ id: 1, name: 'Banana', unit: 'Kg' });
			await db.insert(t_ingredient).values({ id: 2, name: 'Egg', unit: 'Kg' });
			const data = await ingredients_ctrl.getById(1);

			expect(data?.id).toBe(1);
			expect(data?.name).toBe('Banana');
			expect(data?.unit).toBe('Kg');
		});
		it('return element 2 when it exist', async () => {
			await db.delete(t_ingredient);
			await db.insert(t_ingredient).values({ id: 1, name: 'Banana', unit: 'Kg' });
			await db.insert(t_ingredient).values({ id: 2, name: 'Egg', unit: 'Kg' });
			const data = await ingredients_ctrl.getById(2);

			expect(data?.id).toBe(2);
			expect(data?.name).toBe('Egg');
			expect(data?.unit).toBe('Kg');
		});

		it('return null when element 2 does not exist', async () => {
			await db.delete(t_ingredient);
			await db.insert(t_ingredient).values({ id: 1, name: 'Banana', unit: 'Kg' });
			await db.insert(t_ingredient).values({ id: 3, name: 'Water', unit: 'Kg' });
			const data = await ingredients_ctrl.getById(2);

			expect(data).toBe(null);
		});
		it('return null when id is negative, without making db call', async () => {
			const spy_select = vi.spyOn(db, 'select');
			await db.delete(t_ingredient);
			await db.insert(t_ingredient).values({ id: 1, name: 'Banana', unit: 'Kg' });
			await db.insert(t_ingredient).values({ id: 3, name: 'Water', unit: 'Kg' });
			const data = await ingredients_ctrl.getById(-1);

			expect(spy_select).not.toHaveBeenCalled();
			expect(data).toBe(null);
		});

		it('return null when id is zero, without making db call', async () => {
			const spy_select = vi.spyOn(db, 'select');
			await db.delete(t_ingredient);
			await db.insert(t_ingredient).values({ id: 1, name: 'Banana', unit: 'Kg' });
			await db.insert(t_ingredient).values({ id: 3, name: 'Water', unit: 'Kg' });
			const data = await ingredients_ctrl.getById(0);

			expect(spy_select).not.toHaveBeenCalled();
			expect(data).toBe(null);
		});
	});
	describe('add', () => {
		it('insert new ingredient', async () => {
			await db.delete(t_ingredient);
			const element = { name: 'Orange', unit: 'Kg' };
			await ingredients_ctrl.add(element);
			const list = await db.select().from(t_ingredient);
			expect(list.length).toBe(1);
			expect(list[0].id).toBeTruthy();
			expect(list[0].name).toBe(element.name);
			expect(list[0].unit).toBe(element.unit);
			expect(list[1]).toBeFalsy();
		});
	});
});

