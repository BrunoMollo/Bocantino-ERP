import { dev } from '$app/environment';
import { db } from '$lib/server/db';
import {
	t_document_type,
	t_entry_document,
	t_ingredient,
	t_ingredient_batch,
	t_ingridient_entry,
	t_product,
	t_supplier,
	t_user,
	tr_ingredient_batch_ingredient_batch,
	tr_ingredient_ingredient,
	tr_ingredient_product,
	tr_supplier_ingredient
} from '$lib/server/db/schema';
import {
	auth_service,
	ingredient_production_service,
	ingredients_service,
	purchases_service,
	suppliers_service
} from '$logic';
import { product_service } from '$logic/product-logic';
import type { PageServerLoad } from './$types';
import { redirect, type Actions } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	if (!dev) {
		throw redirect(302, '/bocantino/');
	}
};

export const actions: Actions = {
	default: async () => {
		if (!dev) {
			throw redirect(302, '/bocantino/');
		}
		await ___DELETE_ALL___();
		await delay(300);
		await seed();
		return { done: true };
	}
};

function delay(milliseconds: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, milliseconds);
	});
}

async function ___DELETE_ALL___() {
	if (!dev) {
		return;
	}
	db.transaction(async (tx) => {
		// -> 1
		await tx.delete(tr_ingredient_batch_ingredient_batch);
		// -> 2
		await tx.delete(t_ingredient_batch);
		// -> 3
		await tx.delete(t_ingridient_entry);
		// -> 4
		await tx.delete(t_entry_document);
		// -> 5
		await tx.delete(t_document_type);
		// -> 6
		await tx.delete(tr_supplier_ingredient);
		// -> 7
		await tx.delete(t_supplier);
		// -> 8
		await tx.delete(tr_ingredient_product);
		// -> 9
		await tx.delete(t_product);
		// -> 10
		await tx.delete(tr_ingredient_ingredient);
		// -> 11
		await tx.delete(t_ingredient);
		// -> 12
		await tx.delete(t_user);
	});
}

async function seed() {
	if (!dev) {
		return;
	}

	const factura = { id: 1, desc: 'Factura' };
	const remito = { id: 2, desc: 'Remito' };
	const orden_de_compra = { id: 3, desc: 'Orden de compra' };
	await Promise.all([
		db.insert(t_document_type).values(factura),
		db.insert(t_document_type).values(remito),
		db.insert(t_document_type).values(orden_de_compra)
	]);

	const banana = await ingredients_service.add({
		name: 'Banana',
		unit: 'Kg',
		reorderPoint: 120
	});

	const higado = await ingredients_service.add({
		name: 'Higado',
		unit: 'Kg',
		reorderPoint: 100
	});

	const higado_desidatado = await ingredients_service.add(
		{
			name: 'higado desidatado',
			unit: 'Kg',
			reorderPoint: 200
		},
		{ id: higado.id, amount: 2 }
	);

	const julian = await suppliers_service.add({
		name: 'julian',
		email: 'julian@hotmail.com',
		ingredientsIds: [higado.id]
	});

	const first_entry = await purchases_service.registerBoughtIngrediets({
		supplierId: julian.id,
		document: {
			number: 'R-22121',
			issue_date: new Date(2023, 12, 31),
			due_date: new Date(2023, 4, 1),
			typeId: remito.id
		},
		batches: [
			{
				batch_code: 'PPPP_1234',
				initialAmount: 200,
				productionDate: new Date(2023, 12, 30),
				expiration_date: new Date(2023, 1, 30),
				ingredientId: higado.id,
				numberOfBags: 10,
				cost: 2000
			}
		]
	});

	const second_entry = await purchases_service.registerBoughtIngrediets({
		supplierId: julian.id,
		document: {
			number: 'F-11111',
			issue_date: new Date(),
			due_date: new Date(2023, 5, 2),
			typeId: factura.id
		},
		batches: [
			{
				batch_code: 'ABCEDE_1234',
				initialAmount: 300,
				productionDate: new Date(2023, 12, 12),
				expiration_date: new Date(2023, 2, 30),
				ingredientId: higado.id,
				numberOfBags: 10,
				cost: 4000
			},
			{
				batch_code: 'XYZP_1234',
				initialAmount: 200,
				productionDate: new Date(2023, 12, 30),
				expiration_date: new Date(2023, 2, 30),
				ingredientId: higado.id,
				numberOfBags: 10,
				cost: 4500
			}
		]
	});
	await ingredient_production_service.startIngredientProduction(
		{ ingedient_id: higado_desidatado.id, produced_amount: 50 },
		first_entry.batchesId
	);

	await product_service.add({
		desc: 'Alimento para perros',
		ingredients: [
			{ id: banana.id, amount: 10 },
			{ id: higado.id, amount: 20 }
		]
	});

	// leave it last, cache might bring up an error
	await auth_service.createUser({ username: 'admin', password: 'admin' });
}

