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
import { getFirst, type Prettify, type TableInsert } from '$lib/utils';

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
		db.insert(t_document_type).values({ id: 1, desc: 'Factura' }),
		db.insert(t_document_type).values({ id: 2, desc: 'Remito' }),
		db.insert(t_document_type).values({ id: 3, desc: 'Orden de compra' })
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

	await registerBoughtIngrediets({
		supplierId: 1,
		document: { number: 'F-11111', issue_date: new Date(), typeId: 1 },
		batches: [
			{
				batch_code: 'ABCEDE_1234',
				initialAmount: 300,
				productionDate: new Date(2023, 12, 12),
				expirationDate: new Date(2023, 1, 30),
				ingredientId: 1,
				numberOfBags: 10,
				cost: 4000
			},
			{
				batch_code: 'XYZP_1234',
				initialAmount: 200,
				productionDate: new Date(2023, 12, 30),
				expirationDate: new Date(2023, 2, 30),
				ingredientId: 1,
				numberOfBags: 10,
				cost: 4500
			}
		]
	});

	await registerBoughtIngrediets({
		supplierId: 1,
		document: { number: 'R-22121', issue_date: new Date(2023, 12, 31), typeId: 2 },
		batches: [
			{
				batch_code: 'PPPP_1234',
				initialAmount: 200,
				productionDate: new Date(2023, 12, 30),
				expirationDate: new Date(2023, 2, 30),
				ingredientId: 1,
				numberOfBags: 10,
				cost: 2000
			}
		]
	});
}

async function main() {
	await ___DELETE_ALL___();
	await seed();
	console.log('DATABASE SEEDED WITH TESTING DATA');
}
main();

//--------

type RegisterPurchaseDto = Prettify<{
	supplierId: number;
	document: TableInsert<typeof t_entry_document.$inferInsert, 'id'>;
	batches: {
		ingredientId: number;
		batch_code: string;
		initialAmount: number;
		productionDate: Date;
		expirationDate: Date;
		numberOfBags: number;
		cost: number;
	}[];
}>;
export function registerBoughtIngrediets(data: RegisterPurchaseDto) {
	return db.transaction(async (tx) => {
		const { documentId } = await tx
			.insert(t_entry_document)
			.values(data.document)
			.returning({ documentId: t_entry_document.id })
			.then(getFirst);

		const { entry_id } = await tx
			.insert(t_ingridient_entry)
			.values({ totalCost: null, documentId, supplierId: data.supplierId })
			.returning({ entry_id: t_ingridient_entry.id })
			.then(getFirst);

		const { supplierId } = data;
		const batchesId = [] as number[];
		for (let batch of data.batches) {
			const inserted = await tx
				.insert(t_ingredient_batch)
				.values({ ...batch, supplierId, state: 'AVAILABLE', entry_id })
				.returning({ id: t_ingredient_batch.id })
				.then(getFirst);
			batchesId.push(inserted.id);
		}
		return { entry_id, batchesId };
	});
}

