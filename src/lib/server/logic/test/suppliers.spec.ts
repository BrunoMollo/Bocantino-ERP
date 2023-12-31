import { beforeAll, describe, vi, test, expect } from 'vitest';
import { db } from '$lib/server/db/__mocks__';
import { beforeEach } from 'vitest';
import {
	t_entry_document,
	t_ingredient_batch,
	t_ingridient_entry,
	t_supplier,
	tr_ingredient_batch_ingredient_batch,
	tr_supplier_ingredient
} from '$lib/server/db/schema';
import { ingredients_service, suppliers_service } from '$logic';

vi.mock('$lib/server/db/index.ts');

describe.sequential('supplier crud', () => {
	let CHICKEN_ID = 0;
	let FLOUR_ID = 0;
	let POTATOE_ID = 0;
	beforeAll(async () => {
		CHICKEN_ID = await ingredients_service
			.add({
				name: 'Chicken',
				unit: 'Kilogramos',
				reorderPoint: 200
			})
			.then((x) => x.id);
		FLOUR_ID = await ingredients_service
			.add({ name: 'flour', unit: 'Kilogramos', reorderPoint: 200 })
			.then((x) => x.id);
		POTATOE_ID = await ingredients_service
			.add({ name: 'Potato', unit: 'Kilogramos', reorderPoint: 300 })
			.then((x) => x.id);
	});
	describe('add', () => {
		beforeEach(async () => {
			await db.delete(tr_ingredient_batch_ingredient_batch);
			await db.delete(t_ingredient_batch);
			await db.delete(t_ingridient_entry);
			await db.delete(t_entry_document);
			await db.delete(tr_supplier_ingredient);
			await db.delete(t_supplier);
		});
		test('valid supplier with no ingredietns', async () => {
			const data = { name: 'Jon Doe', email: 'jon.doe@gmai.com', ingredientsIds: [] };
			await suppliers_service.add(data);
			const list_suppliers = await db.select().from(t_supplier);
			expect(list_suppliers.length).toBe(1);
			expect(list_suppliers[0].id).toBeTruthy();
			expect(list_suppliers[0].name).toBe(data.name);
			expect(list_suppliers[0].email).toBe(data.email);

			const list_relations = await db.select().from(tr_supplier_ingredient);
			expect(list_relations.length).toBe(0);
		});

		test('valid supplier with one ingredietns', async () => {
			const data = { name: 'Jon Doe', email: 'jon.doe@gmai.com', ingredientsIds: [FLOUR_ID] };
			await suppliers_service.add(data);
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
			const data = {
				name: 'Jon Doe',
				email: 'jon.doe@gmai.com',
				ingredientsIds: [POTATOE_ID, CHICKEN_ID]
			};
			await suppliers_service.add(data);
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

		//TODO:transactions dont work in in memoery database, fix someday
		test('supplier with non existing ingredietn id', async () => {
			const data = { name: 'Pablo Martin', email: 'jon.doe@gmai.com', ingredientsIds: [10000] };
			await expect(async () => {
				await suppliers_service.add(data);
			}).rejects.toThrow();
			// const list_suppliers = await db.select().from(t_supplier);
			// expect(list_suppliers.length).toBe(0);
			// const list_relations = await db.select().from(tr_supplier_ingredient);
			// expect(list_relations.length).toBe(0);
		});
	});
});

