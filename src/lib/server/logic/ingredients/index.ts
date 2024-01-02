import { db, type Tx } from '$lib/server/db';
import {
	t_document_type,
	t_entry_document,
	t_ingredient,
	t_ingredient_batch,
	t_ingridient_entry,
	t_supplier,
	tr_ingredient_ingredient
} from '$lib/server/db/schema';
import { getFirst, getFirstIfPosible, type Prettify, type TableInsert } from '$lib/utils';
import { logicError } from '$logic';
import { eq, asc, and, like } from 'drizzle-orm';
import { inspect } from 'util';

export function getAll() {
	return db.select().from(t_ingredient);
}
export async function deletebyID(id: number) {
	return await db.transaction(async (tx) => {
		await tx.delete(tr_ingredient_ingredient).where(eq(tr_ingredient_ingredient.derivedId, id));
		await tx.delete(t_ingredient).where(eq(t_ingredient.id, id));
	});
}

export async function getById(id: number) {
	if (id <= 0) return null;
	const data = await db.select().from(t_ingredient).where(eq(t_ingredient.id, id));
	const first = data[0];
	if (first === undefined) {
		return null;
	} else {
		return first;
	}
}

export async function add(
	ingredient: Omit<typeof t_ingredient.$inferInsert, 'id'>,
	source?: { id: number; amount: number }
) {
	return await db.transaction(async (tx) => {
		const insertedIngredient = await tx
			.insert(t_ingredient)
			.values(ingredient)
			.returning({ id: t_ingredient.id })
			.then(getFirst);

		if (source) {
			await tx.insert(tr_ingredient_ingredient).values({
				derivedId: insertedIngredient.id,
				sourceId: source.id,
				amount: source.amount
			});
		}
		return insertedIngredient;
	});
}

export async function edit(
	id: number,
	ingredient: Omit<typeof t_ingredient.$inferInsert, 'id'>,
	source?: { id: number; amount: number } | undefined | null
) {
	return await db.transaction(async (tx) => {
		await tx
			.update(t_ingredient)
			.set({ name: ingredient.name, unit: ingredient.unit, reorderPoint: ingredient.reorderPoint })
			.where(eq(t_ingredient.id, id));
		if (source) {
			const relation = await tx
				.select()
				.from(tr_ingredient_ingredient)
				.where(eq(tr_ingredient_ingredient.derivedId, id))
				.then(getFirstIfPosible);
			if (relation) {
				await tx.update(tr_ingredient_ingredient).set({
					amount: source.amount,
					sourceId: source.id
				});
			} else {
				await tx.insert(tr_ingredient_ingredient).values({
					derivedId: id,
					amount: source.amount,
					sourceId: source.id
				});
			}
		} else if (!source) {
			await tx.delete(tr_ingredient_ingredient).where(eq(tr_ingredient_ingredient.derivedId, id));
		}
	});
}

export type RegisterPurchaseDto = Prettify<{
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

export async function getRecipie(id: number) {
	return await db
		.select({
			amount: tr_ingredient_ingredient.amount,
			source: { id: t_ingredient.id, name: t_ingredient.name, unit: t_ingredient.unit }
		})
		.from(tr_ingredient_ingredient)
		.where(eq(tr_ingredient_ingredient.derivedId, id))
		.innerJoin(t_ingredient, eq(tr_ingredient_ingredient.sourceId, t_ingredient.id))
		.then(getFirstIfPosible);
}

export function _calculate_available_amount(data: {
	initialAmount: number;
	usedAmount: number;
	loss: number | null;
	to_be_used_amount: number;
}) {
	return data.initialAmount - data.usedAmount - (data.loss ?? 0) - data.to_be_used_amount;
}

export async function getBatchesByIngredientId(id: number) {
	const list = await db
		.select({
			id: t_ingredient_batch.id,
			batch_code: t_ingredient_batch.batch_code,
			expirationDate: t_ingredient_batch.expirationDate,
			initialAmount: t_ingredient_batch.initialAmount,
			usedAmount: t_ingredient_batch.usedAmount,
			loss: t_ingredient_batch.loss,
			ingredient: t_ingredient,
			to_be_used_amount: t_ingredient_batch.to_be_used_amount
		})
		.from(t_ingredient_batch)
		.innerJoin(t_ingredient, eq(t_ingredient.id, t_ingredient_batch.ingredientId))
		.where(and(eq(t_ingredient_batch.ingredientId, id), eq(t_ingredient_batch.state, 'AVAILABLE')))
		.orderBy(asc(t_ingredient_batch.expirationDate));

	return list.map((batch) => {
		const { id, batch_code, expirationDate, ingredient } = batch;
		const current_amount = _calculate_available_amount(batch);
		return { id, batch_code, expirationDate, ingredient, current_amount };
	});
}

export async function getBatchById(id: number, tx: Tx) {
	const resultset = await (tx ?? db)
		.select({
			id: t_ingredient_batch.id,
			batch_code: t_ingredient_batch.batch_code,
			expirationDate: t_ingredient_batch.expirationDate,
			initialAmount: t_ingredient_batch.initialAmount,
			usedAmount: t_ingredient_batch.usedAmount,
			loss: t_ingredient_batch.loss,
			ingredient: t_ingredient,
			to_be_used_amount: t_ingredient_batch.to_be_used_amount
		})
		.from(t_ingredient_batch)
		.innerJoin(t_ingredient, eq(t_ingredient.id, t_ingredient_batch.ingredientId))
		.where(eq(t_ingredient_batch.id, id));

	const list = resultset.map((batch) => {
		const { id, batch_code, expirationDate, ingredient } = batch;
		const current_amount = _calculate_available_amount(batch);
		return { id, batch_code, expirationDate, ingredient, current_amount };
	});

	return getFirstIfPosible(list);
}

async function _select_current_to_be_used_amount(id: number, tx: Tx) {
	return await tx
		.select({ current_to_be_used_amount: t_ingredient_batch.to_be_used_amount })
		.from(t_ingredient_batch)
		.where(eq(t_ingredient_batch.id, id))
		.then(getFirst)
		.then((x) => x.current_to_be_used_amount);
}

export async function startIngredientProduction(
	ingredient: { ingedient_id: number; produced_amount: number },
	batches_ids: number[]
) {
	const { ingedient_id, produced_amount } = ingredient;

	if (produced_amount <= 0) {
		return logicError('cantidad a producit invalida');
	}
	if (batches_ids.length < 1 || batches_ids.length > 2) {
		return logicError('cantidad invalida de lotes');
	}
	if ([...new Set(batches_ids)].length != batches_ids.length) {
		return logicError('No se puede usar dos veces el mismo lote');
	}

	const recipe = await getRecipie(ingedient_id);
	if (!recipe) {
		return logicError('El ingrediente no es derivado');
	}

	const needed_amount = produced_amount * recipe.amount;

	const result = await db.transaction(async (tx) => {
		const batches = [] as Exclude<Awaited<ReturnType<typeof getBatchById>>, undefined>[];

		for (let id of batches_ids) {
			const batch = await getBatchById(id, tx);
			if (!batch) {
				return logicError(`El lote con id ${id} no existe`);
			}

			if (recipe.source.id != batch.ingredient.id) {
				return logicError(
					`El ingrediente deriva de ${recipe.source.name} no de ${batch.ingredient.name}`
				);
			}

			batches.push(batch);
		}

		const total_available_source = batches
			.map((x) => x?.current_amount ?? 0)
			.reduce((acc, prev) => acc + prev, 0);
		if (total_available_source < needed_amount) {
			return logicError(
				`Se requieren ${needed_amount}${batches[0]?.ingredient.unit} pero solo hay ${total_available_source}`
			);
		}

		const total_available_source_minus_one = batches
			.filter((_, i) => i != 0)
			.map((x) => x?.current_amount ?? 0)
			.reduce((acc, prev) => acc + prev, 0);
		if (total_available_source_minus_one > needed_amount) {
			return logicError('Se indicarion mas lotes de los necesarios');
		}

		let asigned_amount = 0;
		const still_needed_amount = () => needed_amount - asigned_amount;
		for (let batch of batches) {
			const current_to_be_used_amount_fist_batch = await _select_current_to_be_used_amount(
				batch.id,
				tx
			);
			const used_in_batch =
				still_needed_amount() > batch.current_amount ? batch.current_amount : still_needed_amount();
			asigned_amount += used_in_batch;
			await tx
				.update(t_ingredient_batch)
				.set({ to_be_used_amount: current_to_be_used_amount_fist_batch + used_in_batch })
				.where(eq(t_ingredient_batch.id, batch.id));
		}
		const new_batch = await tx
			.insert(t_ingredient_batch)
			.values({
				batch_code: 'BOCANTINO-' + (ingedient_id + Date.now()).toString(),
				initialAmount: produced_amount,
				productionDate: new Date(),
				expirationDate: new Date(), //TODO: Define how is the expirationDate calualted
				ingredientId: ingedient_id,
				numberOfBags: 1,
				state: 'IN_PRODUCTION'
			})
			.returning({ id: t_ingredient_batch.id })
			.then(getFirst);
		return new_batch;
	});

	return result;
}

export async function getEntries(input: { supplierName?: string; pageSize: number; page: number }) {
	const entries = await db
		.select({
			id: t_ingridient_entry.id,
			supplier: t_supplier.name,
			date: t_ingridient_entry.creation_date,
			document: {
				number: t_entry_document.number,
				issue_date: t_entry_document.issue_date,
				type: t_document_type.desc
			}
		})
		.from(t_ingridient_entry)
		.innerJoin(t_supplier, eq(t_ingridient_entry.supplierId, t_supplier.id))
		.innerJoin(t_entry_document, eq(t_entry_document.id, t_ingridient_entry.documentId))
		.innerJoin(t_document_type, eq(t_entry_document.typeId, t_document_type.id))
		.where(like(t_supplier.name, `${input.supplierName ?? ''}%`))
		.limit(input.pageSize)
		.offset(input.page * input.pageSize);
	return entries;
}

export async function getBatchesByEntryId(entry_id: number) {
	return await db
		.select({
			code: t_ingredient_batch.batch_code,
			ingredient: t_ingredient.name,
			initialAmount: t_ingredient_batch.initialAmount,
			bags: t_ingredient_batch.numberOfBags,
			productionDate: t_ingredient_batch.productionDate,
			expirationDate: t_ingredient_batch.expirationDate,
			cost: t_ingredient_batch.cost
		})
		.from(t_ingredient_batch)
		.innerJoin(t_ingredient, eq(t_ingredient.id, t_ingredient_batch.ingredientId))
		.where(eq(t_ingredient_batch.entry_id, entry_id));
}

