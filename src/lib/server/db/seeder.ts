import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
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
} from './schema';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();
const { TURSO_URL, TURSO_TOKEN } = process.env;
if (!TURSO_URL || !TURSO_TOKEN) {
	throw new Error('Define TURSO_URL and TURSO_TOKEN in .env file');
}

const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });
const db = drizzle(client, { schema, logger: true });
async function ___DELETE_ALL___() {
	// -> 1
	await db.delete(t_ingredient_batch);
	// -> 2
	await db.delete(t_ingridient_entry);
	// -> 3
	await db.delete(t_entry_document);
	// -> 4
	await db.delete(t_document_type);
	// -> 5
	await db.delete(tr_supplier_ingredient);
	// -> 6
	await db.delete(t_supplier);
	// -> 7
	await db.delete(tr_ingredient_product);
	// -> 8
	await db.delete(t_product);
	// -> 9
	await db.delete(tr_ingredient_ingredient);
	// -> 10
	await db.delete(t_ingredient);
}

async function seed() {
	await Promise.all([
		db.insert(t_document_type).values({ desc: 'Factura' }),
		db.insert(t_document_type).values({ desc: 'Remito' }),
		db.insert(t_document_type).values({ desc: 'Orden de compra' })
	]);
	await db
		.insert(t_ingredient)
		.values({ id: 1, name: 'Higado', unit: 'Kilogramos', reorderPoint: 100 });

	await db
		.insert(t_ingredient)
		.values({ id: 2, name: 'Higado  desidratado', unit: 'Kilogramos', reorderPoint: 200 });
	await db.insert(tr_ingredient_ingredient).values({ derivedId: 2, sourceId: 1, amount: 2 });

	await db.insert(t_supplier).values({ id: 1, name: 'julian', email: 'julian@hotmail.com' });
	await db.insert(tr_supplier_ingredient).values({ supplierId: 1, ingredientId: 1 });

	await db.insert(t_ingredient_batch).values({
		id: 1,
		batch_code: 'ABCEDE_1234',
		initialAmount: 300,
		productionDate: new Date(2023, 12, 12),
		expirationDate: new Date(2023, 1, 30),
		ingredientId: 1,
		numberOfBags: 10,
		state: 'AVAILABLE',
		supplierId: 1,
		cost: 4000
	});

	await db.insert(t_ingredient_batch).values({
		id: 2,
		batch_code: 'XYZP_1234',
		initialAmount: 200,
		productionDate: new Date(2023, 12, 30),
		expirationDate: new Date(2023, 2, 30),
		ingredientId: 1,
		numberOfBags: 10,
		state: 'AVAILABLE',
		supplierId: 1,
		cost: 4500
	});

	await db.insert(t_ingredient_batch).values({
		id: 3,
		batch_code: 'PPPP_1234',
		initialAmount: 200,
		usedAmount: 200,
		productionDate: new Date(2023, 12, 30),
		expirationDate: new Date(2023, 2, 30),
		ingredientId: 1,
		numberOfBags: 10,
		state: 'EMPTY',
		supplierId: 1,
		cost: 2000
	});
}

async function main() {
	await ___DELETE_ALL___();
	await seed();
	console.log('DATABASE SEEDED WITH TESTING DATA');
}
main();

