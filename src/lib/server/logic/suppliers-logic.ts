import { db } from '$lib/server/db';
import { t_ingredient, t_supplier, tr_supplier_ingredient } from '$lib/server/db/schema';
import { getFirst, type TableInsert } from '$lib/utils';
import { eq } from 'drizzle-orm';
import { drizzle_map, pick_columns } from 'drizzle-tools';

type NewSupplierDto = TableInsert<typeof t_supplier.$inferInsert, 'id'> & {
	ingredientsIds: number[];
};
export async function add(data: NewSupplierDto) {
	const { name, email, ingredientsIds } = data;

	const id = await db.transaction(async (tx) => {
		const { generatedId } = await tx
			.insert(t_supplier)
			.values({ name, email })
			.returning({ generatedId: t_supplier.id })
			.then(getFirst);
		for (const ingredientId of ingredientsIds) {
			await tx.insert(tr_supplier_ingredient).values({ supplierId: generatedId, ingredientId });
		}
		return generatedId;
	});

	return { id };
}

export async function getAll() {
	return await db
		.select({ t_supplier, ingredients: pick_columns(t_ingredient, ['id', 'name', 'unit']) })
		.from(t_supplier)
		.leftJoin(tr_supplier_ingredient, eq(tr_supplier_ingredient.supplierId, t_supplier.id))
		.leftJoin(t_ingredient, eq(tr_supplier_ingredient.ingredientId, t_ingredient.id))
		.then(drizzle_map({ one: 't_supplier', with_one: [], with_many: ['ingredients'] }));
}

