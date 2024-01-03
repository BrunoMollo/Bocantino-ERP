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
	tr_ingredient_ingredient,
	tr_ingredient_product,
	tr_supplier_ingredient
} from '$lib/server/db/schema';
import { ingredients_service, purchases_service, suppliers_service } from '$logic';
import type { PageServerLoad } from './$types';
import { redirect, type Actions } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	if (!dev) {
		throw redirect(302, '/');
	}
};

export const actions: Actions = {
	default: async () => {
		if (!dev) {
			throw redirect(302, '/');
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
		await tx.delete(t_ingredient_batch);
		// -> 2
		await tx.delete(t_ingridient_entry);
		// -> 3
		await tx.delete(t_entry_document);
		// -> 4
		await tx.delete(t_document_type);
		// -> 5
		await tx.delete(tr_supplier_ingredient);
		// -> 6
		await tx.delete(t_supplier);
		// -> 7
		await tx.delete(tr_ingredient_product);
		// -> 8
		await tx.delete(t_product);
		// -> 9
		await tx.delete(tr_ingredient_ingredient);
		// -> 10
		await tx.delete(t_ingredient);
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
		unit: 'Kilogramos',
		reorderPoint: 120
	});

	const higado = await ingredients_service.add({
		name: 'Higado',
		unit: 'Kilogramos',
		reorderPoint: 100
	});

	const higado_desidatado = await ingredients_service.add(
		{
			name: 'higado desidatado',
			unit: 'Kilogramos',
			reorderPoint: 200
		},
		{ id: higado.id, amount: 2 }
	);

	const julian = await suppliers_service.add({
		name: 'julian',
		email: 'julian@hotmail.com',
		ingredientsIds: [higado.id]
	});

	await purchases_service.registerBoughtIngrediets({
		supplierId: julian.id,
		document: { number: 'F-11111', issue_date: new Date(), typeId: factura.id },
		batches: [
			{
				batch_code: 'ABCEDE_1234',
				initialAmount: 300,
				productionDate: new Date(2023, 12, 12),
				expirationDate: new Date(2023, 1, 30),
				ingredientId: higado.id,
				numberOfBags: 10,
				cost: 4000
			},
			{
				batch_code: 'XYZP_1234',
				initialAmount: 200,
				productionDate: new Date(2023, 12, 30),
				expirationDate: new Date(2023, 2, 30),
				ingredientId: higado.id,
				numberOfBags: 10,
				cost: 4500
			}
		]
	});

	await purchases_service.registerBoughtIngrediets({
		supplierId: julian.id,
		document: { number: 'R-22121', issue_date: new Date(2023, 12, 31), typeId: remito.id },
		batches: [
			{
				batch_code: 'PPPP_1234',
				initialAmount: 200,
				productionDate: new Date(2023, 12, 30),
				expirationDate: new Date(2023, 2, 30),
				ingredientId: higado.id,
				numberOfBags: 10,
				cost: 2000
			}
		]
	});
}

