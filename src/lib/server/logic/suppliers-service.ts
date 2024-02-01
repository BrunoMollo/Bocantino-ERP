import { db } from '$lib/server/db';
import { t_ingredient, t_supplier, tr_supplier_ingredient } from '$lib/server/db/schema';
import { getFirst, type TableInsert } from '$lib/utils';
import { eq } from 'drizzle-orm';
import { drizzle_map, pick_columns } from 'drizzle-tools';

class SuppliersService {
	async getById(supplier_id: number) {
		return await db
			.select()
			.from(t_supplier)
			.where(eq(t_supplier.id, supplier_id))
			.leftJoin(tr_supplier_ingredient, eq(tr_supplier_ingredient.supplier_id, t_supplier.id))
			.then(drizzle_map({ one: 'supplier', with_one: [], with_many: ['r_supplier_ingredient'] }));
	}
	async add(
		data: TableInsert<typeof t_supplier.$inferInsert, 'id'> & {
			ingredientsIds: number[];
		}
	) {
		const { name, email, cuit, phone_number, address, ingredientsIds } = data;

		const id = await db.transaction(async (tx) => {
			const { generatedId } = await tx
				.insert(t_supplier)
				.values({ name, email, cuit, phone_number, address })
				.returning({ generatedId: t_supplier.id })
				.then(getFirst);
			for (const ingredient_id of ingredientsIds) {
				await tx.insert(tr_supplier_ingredient).values({ supplier_id: generatedId, ingredient_id });
			}
			return generatedId;
		});

		return { id };
	}

	async getAll() {
		return await db
			.select({ t_supplier, ingredients: pick_columns(t_ingredient, 'id', 'name', 'unit') })
			.from(t_supplier)
			.leftJoin(tr_supplier_ingredient, eq(tr_supplier_ingredient.supplier_id, t_supplier.id))
			.leftJoin(t_ingredient, eq(tr_supplier_ingredient.ingredient_id, t_ingredient.id))
			.then(drizzle_map({ one: 't_supplier', with_one: [], with_many: ['ingredients'] }));
	}
}

export const suppliers_service = new SuppliersService();

