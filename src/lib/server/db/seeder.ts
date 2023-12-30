// modules are imported with required because is was the easyest way to run the script,
// if you change it it might brake the `npm run db-clean` comand.
const { createClient } = require('@libsql/client');
const { drizzle } = require('drizzle-orm/libsql');
const {
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
} = require('./schema');
const schema = require('./schema');
const dotenv = require('dotenv');

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
		db.insert(t_document_type).values({ desc: 'Orden de compra' }),
		db.insert(t_supplier).values({ name: 'BOCANTINO', email: 'not-needed' })
	]);
}

async function main() {
	await ___DELETE_ALL___();
	await seed();
	console.log('DATABASE SEEDED WITH TESTING DATA');
}
main();

