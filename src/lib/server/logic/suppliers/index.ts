import { db } from '$lib/server/db';
import { t_supplier, tr_supplier_ingredient } from '$lib/server/db/schema';
import { getFirst, type TableInsert } from '$lib/utils';

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
	const resultSet = await db.query.t_supplier.findMany({
		with: {
			r_supplier_ingredient: {
				columns: {},
				with: {
					ingredient: true
				}
			}
		}
	});
	const suppliers = resultSet.map(({ id, name, email, r_supplier_ingredient }) => ({
		id,
		name,
		email,
		ingredients: r_supplier_ingredient.map(({ ingredient }) => ingredient)
	}));

	return suppliers;
}
