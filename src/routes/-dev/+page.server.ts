import { dev } from '$app/environment';
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

	await purchases_service.registerBoughtIngrediets_Invoice({
		withdrawal_tax_amount: 10,
		iva_tax_percentage: 21,
		supplier_id: julian.id,
		document: {
			number: 'R-00000000',
			issue_date: new Date(2023, 12, 31),
			due_date: new Date(2023, 4, 1)
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
	const first_entry = await purchases_service.registerBoughtIngrediets_Invoice({
		withdrawal_tax_amount: 10,
		iva_tax_percentage: 21,
		supplier_id: julian.id,
		document: {
			number: 'R-22121',
			issue_date: new Date(2023, 12, 31),
			due_date: new Date(2023, 4, 1)
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
	const banana_batch_id = first_entry.batchesId[0];

	const second_entry = await purchases_service.registerBoughtIngrediets_Invoice({
		withdrawal_tax_amount: 10,
		iva_tax_percentage: 21,
		supplier_id: julian.id,
		document: {
			number: 'F-11111',
			issue_date: new Date(),
			due_date: new Date(2023, 5, 2)
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

	await purchases_service.registerBoughtIngrediets_EntryNote({
		supplier_id: julian.id,
		document: {
			number: 'EN-11111'
		},
		batches: [
			{
				batch_code: 'EXYZP_567',
				initial_amount: 300,
				production_date: new Date(2023, 12, 12),
				expiration_date: new Date(2023, 2, 30),
				ingredient_id: higado.id,
				number_of_bags: 10,
				cost: 4000
			}
		]
	});

	const liver_batch_id = second_entry.batchesId[0];
	await ingredient_production_service.startIngredientProduction(
		{ ingedient_id: higado_desidatado.id, produced_amount: 2 },
		[liver_batch_id]
	);
	const res = await ingredient_production_service.startIngredientProduction(
		{ ingedient_id: higado_desidatado.id, produced_amount: 4 },
		[liver_batch_id]
	);
	if (res.type == 'SUCCESS') {
		ingredient_production_service.closeProduction({ batch_id: res.id, adjustment: -1 });
	}
	{
		const { id: product_id } = await product_service.add({
			desc: 'Alimento para perros',
			ingredients: [
				{ ingredient_id: banana.id, amount: 1 },
				{ ingredient_id: higado.id, amount: 2 }
			]
		});
		const product_batch_id = await product_service
			.startProduction({
				product_id,
				produced_amount: 10,
				recipe: [
					{ ingredient_id: banana.id, amount: 1 },
					{ ingredient_id: higado.id, amount: 2 }
				],
				batches_ids: [[banana_batch_id], [liver_batch_id]]
			})
			.then((x) => (x.type === 'SUCCESS' ? x.data.id : -1));

		await product_service.closeProduction({ batch_id: product_batch_id, adjustment: 0 });

		await product_service
			.startProduction({
				product_id,
				produced_amount: 10,
				recipe: [
					{ ingredient_id: banana.id, amount: 1 },
					{ ingredient_id: higado.id, amount: 2 }
				],
				batches_ids: [[banana_batch_id], [liver_batch_id]]
			})
			.then((x) => (x.type === 'SUCCESS' ? x.data.id : -1));
	}

	// leave it last, cache might bring up an error
	await auth_service.createUser({ username: 'admin', password: 'admin' });
}
