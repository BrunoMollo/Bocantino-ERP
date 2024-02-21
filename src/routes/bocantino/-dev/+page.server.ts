import { dev } from '$app/environment';
import { db } from '$lib/server/db';
import { t_document_type } from '$lib/server/db/schema';
import { auth_service } from '$logic/auth-service';
import { ingredient_production_service } from '$logic/ingredient-production-service';
import { purchases_service } from '$logic/ingredient-purchase-service';
import { ingredients_service } from '$logic/ingredient-service';
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
		reorder_point: 120,
		nutrient_protein: 1,
		nutrient_carb: 3,
		nutrient_fat: 1,
		nutrient_ashes: 0,
		nutrient_fiber: 0,
		nutrient_calcium: 0,
		nutrient_sodium: 0,
		nutrient_humidity: 0,
		nutrient_phosphorus: 0
	});

	const higado = await ingredients_service.add({
		name: 'Higado',
		unit: 'Kg',
		reorder_point: 100,
		nutrient_protein: 8,
		nutrient_carb: 2,
		nutrient_fat: 6,
		nutrient_ashes: 0,
		nutrient_fiber: 0,
		nutrient_calcium: 0,
		nutrient_sodium: 0,
		nutrient_humidity: 0,
		nutrient_phosphorus: 0
	});

	const higado_desidatado = await ingredients_service.add(
		{
			name: 'higado desidatado',
			unit: 'Kg',
			reorder_point: 200,
			nutrient_protein: 4,
			nutrient_carb: 1,
			nutrient_fat: 3,
			nutrient_ashes: 0,
			nutrient_fiber: 0,
			nutrient_calcium: 0,
			nutrient_sodium: 0,
			nutrient_humidity: 0,
			nutrient_phosphorus: 0
		},
		{ id: higado.id, amount: 2 }
	);

	const julian = await suppliers_service.add({
		name: 'julian',
		email: 'julian@hotmail.com',
		cuit: '123456789',
		phone_number: '3364123456',
		address: 'Fake Street 123',
		ingredientsIds: [higado.id, banana.id]
	});

	const first_entry = await purchases_service.registerBoughtIngrediets({
		perceptions_tax_amount: 10,
		iva_tax_percentage: 21,
		supplier_id: julian.id,
		document: {
			number: 'R-22121',
			issue_date: new Date(2023, 12, 31),
			due_date: new Date(2023, 4, 1),
			typeId: remito.id
		},
		batches: [
			{
				batch_code: 'PPPP_1234',
				initial_amount: 200,
				production_date: new Date(2023, 12, 30),
				expiration_date: new Date(2023, 1, 30),
				ingredient_id: banana.id,
				number_of_bags: 10,
				cost: 2000
			}
		]
	});

	const second_entry = await purchases_service.registerBoughtIngrediets({
		perceptions_tax_amount: 10,
		iva_tax_percentage: 21,
		supplier_id: julian.id,
		document: {
			number: 'F-11111',
			issue_date: new Date(),
			due_date: new Date(2023, 5, 2),
			typeId: factura.id
		},
		batches: [
			{
				batch_code: 'ABCEDE_1234',
				initial_amount: 300,
				production_date: new Date(2023, 12, 12),
				expiration_date: new Date(2023, 2, 30),
				ingredient_id: higado.id,
				number_of_bags: 10,
				cost: 4000
			},
			{
				batch_code: 'XYZP_1234',
				initial_amount: 200,
				production_date: new Date(2023, 12, 30),
				expiration_date: new Date(2023, 2, 30),
				ingredient_id: higado.id,
				number_of_bags: 10,
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
			{ ingredient_id: banana.id, amount: 10 },
			{ ingredient_id: higado.id, amount: 20 }
		]
	});

	// leave it last, cache might bring up an error
	await auth_service.createUser({ username: 'admin', password: 'admin' });
}

