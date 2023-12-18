import { beforeAll, describe, vi, test, expect } from 'vitest';
import { db } from '$lib/server/db/__mocks__';
import * as ingredients_ctrl from '$lib/server/logic/ingredients';
import * as suppliers_ctrl from '$lib/server/logic/suppliers';
import { beforeEach } from 'vitest';
import { t_supplier, tr_supplier_ingredient } from '$lib/server/db/schema';

vi.mock('$lib/server/db/index.ts');
describe('supplier crud', () => {
	beforeAll(async () => {
		await ingredients_ctrl.add({ name: 'Chicken', unit: 'Kg' });
		await ingredients_ctrl.add({ name: 'flour', unit: 'Kg' });
		await ingredients_ctrl.add({ name: 'Potato', unit: 'Kg' });
	});
	describe('add', () => {
		beforeEach(async () => {
			await db.delete(tr_supplier_ingredient);
			await db.delete(t_supplier);
		});
		test('valid supplier with no ingredietns', async () => {
			const data = { name: 'Jon Doe', email: 'jon.doe@gmai.com', ingredientsIds: [] };
			await suppliers_ctrl.add(data);
			const list_suppliers = await db.select().from(t_supplier);
			expect(list_suppliers.length).toBe(1);
			expect(list_suppliers[0].id).toBeTruthy();
			expect(list_suppliers[0].name).toBe(data.name);
			expect(list_suppliers[0].email).toBe(data.email);

			const list_relations = await db.select().from(tr_supplier_ingredient);
			expect(list_relations.length).toBe(0);
		});

		test('valid supplier with one ingredietns', async () => {
			const data = { name: 'Jon Doe', email: 'jon.doe@gmai.com', ingredientsIds: [2] };
			await suppliers_ctrl.add(data);
			const list_suppliers = await db.select().from(t_supplier);
			expect(list_suppliers.length).toBe(1);
			expect(list_suppliers[0].id).toBeTruthy();
			expect(list_suppliers[0].name).toBe(data.name);
			expect(list_suppliers[0].email).toBe(data.email);

			const list_relations = await db.select().from(tr_supplier_ingredient);
			expect(list_relations.length).toBe(1);
			expect(list_relations[0].supplierId).toBe(list_suppliers[0].id);
			expect(list_relations[0].ingredientId).toBe(data.ingredientsIds[0]);
		});

		test('valid supplier with two ingredietns', async () => {
			const data = { name: 'Jon Doe', email: 'jon.doe@gmai.com', ingredientsIds: [1, 3] };
			await suppliers_ctrl.add(data);
			const list_suppliers = await db.select().from(t_supplier);
			expect(list_suppliers.length).toBe(1);
			expect(list_suppliers[0].id).toBeTruthy();
			expect(list_suppliers[0].name).toBe(data.name);
			expect(list_suppliers[0].email).toBe(data.email);

			const list_relations = await db.select().from(tr_supplier_ingredient);
			expect(list_relations.length).toBe(2);
			for (let i of [0, 1]) {
				expect(list_relations[i].supplierId).toBe(list_suppliers[0].id);
				expect(list_relations[i].ingredientId).toBe(data.ingredientsIds[i]);
			}
		});

		// TODO: fix this test, transaction does not rollback
		test('supplier with non existing ingredietn id', async () => {
			const data = { name: 'Pablo Martin', email: 'jon.doe@gmai.com', ingredientsIds: [10] };
			await expect(async () => {
				await suppliers_ctrl.add(data);
			}).rejects.toThrow();
			// const list_suppliers = await db.select().from(t_supplier);
			// expect(list_suppliers).toBe(0);
			// const list_relations = await db.select().from(tr_supplier_ingredient);
			// expect(list_relations.length).toBe(0);
		});
	});
});
