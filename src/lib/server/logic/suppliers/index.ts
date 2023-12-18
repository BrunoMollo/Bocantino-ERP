import { db } from '$lib/server/db';
import { t_supplier, tr_supplier_ingredient } from '$lib/server/db/schema';
import { getFirst, type TableInsert } from '$lib/utils';

type NewSupplierDto = TableInsert<typeof t_supplier.$inferInsert, 'id'> & {
	ingredientsIds: number[];
};
export async function add(data: NewSupplierDto) {
	const { name, email, ingredientsIds } = data;

	await db.transaction(async (tx) => {
		const { generatedId } = await tx
			.insert(t_supplier)
			.values({ name, email })
			.returning({ generatedId: t_supplier.id })
			.then(getFirst);

		for (const ingredientId of ingredientsIds) {
			await tx.insert(tr_supplier_ingredient).values({ supplierId: generatedId, ingredientId });
		}
	});
}
