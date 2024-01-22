import { dev } from '$app/environment';
import { db } from '$lib/server/db';
import { t_document_type } from '$lib/server/db/schema';
import { ingredient_production_service, ingredients_service, purchases_service } from '$logic';
import { auth_service } from '$logic/auth-service';
import { product_service } from '$logic/product-service';
import { suppliers_service } from '$logic/suppliers-service';
import { __DELETE_ALL_DATABASE } from '$logic/test/utils';
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
		await __DELETE_ALL_DATABASE();
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
		ingredientsIds: [higado.id, banana.id]
	});

	const first_entry = await purchases_service.registerBoughtIngrediets({
		perceptions_tax: 10,
		iva_tax: 21,
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
				ingredientId: banana.id,
				numberOfBags: 10,
				cost: 2000
			}
		]
	});

	const second_entry = await purchases_service.registerBoughtIngrediets({
		perceptions_tax: 10,
		iva_tax: 21,
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

