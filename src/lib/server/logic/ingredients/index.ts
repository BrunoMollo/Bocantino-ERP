import { db, type Tx } from '$lib/server/db';
import {
	t_entry_document,
	t_ingredient,
	t_ingredient_batch,
	t_ingridient_entry,
	tr_ingredient_ingredient
} from '$lib/server/db/schema';
import { getFirst, getFirstIfPosible, type Prettify, type TableInsert } from '$lib/utils';
import { logicError } from '$logic';
import { eq, desc } from 'drizzle-orm';

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
			await db.delete(tr_ingredient_ingredient).where(eq(tr_ingredient_ingredient.derivedId, id));
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

		await tx
			.insert(t_ingridient_entry)
			.values({ totalCost: null, documentId, supplierId: data.supplierId });

		const { supplierId } = data;
		const batchesId = [] as number[];
		for (let batch of data.batches) {
			const inserted = await tx
				.insert(t_ingredient_batch)
				.values({ ...batch, supplierId, state: 'AVAILABLE' })
				.returning({ id: t_ingredient_batch.id })
				.then(getFirst);
			batchesId.push(inserted.id);
		}
		return batchesId;
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
		.where(eq(t_ingredient_batch.ingredientId, id))
		.orderBy(desc(t_ingredient_batch.expirationDate));

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
	source: { selected_batch_id: number; second_selected_batch_id?: number }
) {
	const { ingedient_id, produced_amount } = ingredient;
	const { selected_batch_id, second_selected_batch_id } = source;

	if (selected_batch_id === second_selected_batch_id) {
		return logicError('No se puede usar dos veces el mismo lote');
	}

	// RETRIVES RECIPE
	const recipe = await getRecipie(ingedient_id);
	if (!recipe) {
		return logicError('El ingrediente no es derivado');
	}
	const needed_amount = produced_amount * recipe.amount;

	const result = await db.transaction(async (tx) => {
		//RETRIVES FIRST BATCH
		const batch = await getBatchById(selected_batch_id, tx);
		if (!batch) {
			return logicError(`El lote con id ${selected_batch_id} no existe`);
		}
		if (recipe.source.id != batch.ingredient.id) {
			return logicError(
				`El ingrediente deriva de ${recipe.source.name} no de ${batch.ingredient.name}`
			);
		}
		if (second_selected_batch_id && batch.current_amount >= needed_amount) {
			return logicError('El segundo lote no es necesario');
		}

		//RETRIVES SECOND BACHE IF NEEDED
		let second_batch = null;
		if (second_selected_batch_id) {
			second_batch = await getBatchById(second_selected_batch_id, tx);
			if (!second_batch) {
				return logicError(`El segundo lote  con id ${second_selected_batch_id} no existe`);
			}
			if (recipe.source.id != second_batch.ingredient.id) {
				return logicError(
					`El ingrediente deriva de ${recipe.source.name} no de ${second_batch.ingredient.name}`
				);
			}
		}

		// UPDATE FIRST BATCH TEMPORARY COLUMN
		const total_source_available = batch.current_amount + (second_batch?.current_amount ?? 0);
		if (total_source_available < needed_amount) {
			return logicError(
				`Needs ${needed_amount} ${recipe.source.unit} of ${recipe.source.name} but only have ${total_source_available}`
			);
		}

		const used_in_first_batch = second_selected_batch_id ? batch.current_amount : needed_amount;

		const current_to_be_used_amount_fist_batch = await _select_current_to_be_used_amount(
			selected_batch_id,
			tx
		);

		await tx
			.update(t_ingredient_batch)
			.set({ to_be_used_amount: current_to_be_used_amount_fist_batch + used_in_first_batch })
			.where(eq(t_ingredient_batch.id, selected_batch_id));

		// UPDATE SECOND BATCH TEMPORARY COLUMN IF NEEDED
		if (second_selected_batch_id) {
			const current_to_be_used_amount_second_batch = await _select_current_to_be_used_amount(
				second_selected_batch_id,
				tx
			);
			const used_in_second_batch = needed_amount - used_in_first_batch;
			await tx
				.update(t_ingredient_batch)
				.set({ to_be_used_amount: used_in_second_batch + current_to_be_used_amount_second_batch })
				.where(eq(t_ingredient_batch.id, second_selected_batch_id));
		}
	});

	//CREATE BATCH TO PRODUCE
	//TODO: CONTINUE
	// NEEDS BOCANTINO AS A SUPPLIER
	return result ?? {};
}

