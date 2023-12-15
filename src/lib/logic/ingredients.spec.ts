import { describe, it, expect, vi } from 'vitest';
import { ingredients_ctrl } from './ingredients';
import { db } from '../__mocks__';
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
});

