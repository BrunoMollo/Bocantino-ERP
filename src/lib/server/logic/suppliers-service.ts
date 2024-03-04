import { db } from '$lib/server/db';
import { t_ingredient, t_supplier, tr_supplier_ingredient } from '$lib/server/db/schema';
import { getFirst, getFirstIfPosible, type TableInsert } from '$lib/utils';
import { is_ok } from '$logic';
import { and, eq } from 'drizzle-orm';
import { drizzle_map, pick_columns } from 'drizzle-tools';

class SuppliersService {
	async edit(
		supplier_id: number,
		data: {
			name: string;
			email: string;
			cuit: string;
			phone_number: string;
			address: string;
			ingredientsIds: number[];
		}
	) {
		db.transaction(async (tx) => {
			const { name, email, cuit, phone_number, address } = data;
			await tx
				.update(t_supplier)
				.set({ name, email, cuit, phone_number, address })
				.where(eq(t_supplier.id, supplier_id));

			const current_ingredients = await tx
				.select()
				.from(tr_supplier_ingredient)
				.where(eq(tr_supplier_ingredient.supplier_id, supplier_id));

			// add ingredients
			for (const ingredient_id of data.ingredientsIds) {
				const match = current_ingredients.find((x) => x.ingredient_id == ingredient_id);
				if (!match) {
					await db.insert(tr_supplier_ingredient).values({ supplier_id, ingredient_id });
				} else if (match.disabled) {
					await db
						.update(tr_supplier_ingredient)
						.set({ disabled: false })
						.where(eq(tr_supplier_ingredient.id, match.id));
				}
			}

			// remove ingredients
			for (const curr_ingr of current_ingredients) {
				const should_remove = !data.ingredientsIds.includes(curr_ingr.ingredient_id);
				if (should_remove) {
					await db
						.update(tr_supplier_ingredient)
						.set({ disabled: true })
						.where(eq(tr_supplier_ingredient.id, curr_ingr.id));
				}
			}
		});
		return is_ok(null);
	}

	async getById(supplier_id: number) {
		return await db
			.select({
				t_supplier,
				ingredients: pick_columns(tr_supplier_ingredient, 'id', 'ingredient_id')
			})
			.from(t_supplier)
			.where(eq(t_supplier.id, supplier_id))
			.leftJoin(
				tr_supplier_ingredient,
				and(
					eq(tr_supplier_ingredient.supplier_id, t_supplier.id),
					eq(tr_supplier_ingredient.disabled, false)
				)
			)
			.then(drizzle_map({ one: 't_supplier', with_one: [], with_many: ['ingredients'] }))
			.then(getFirstIfPosible);
	}

	async add(
		data: TableInsert<typeof t_supplier.$inferInsert, 'id'> & {
			ingredientsIds: number[];
		}
	) {
		const { name, email, contact_person, comment, cuit, phone_number, address, ingredientsIds } =
			data;

		const id = await db.transaction(async (tx) => {
			const { generatedId } = await tx
				.insert(t_supplier)
				.values({ name, email, contact_person, comment, cuit, phone_number, address })
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
			.leftJoin(
				t_ingredient,
				and(
					eq(tr_supplier_ingredient.ingredient_id, t_ingredient.id),
					eq(tr_supplier_ingredient.disabled, false)
				)
			)
			.then(drizzle_map({ one: 't_supplier', with_one: [], with_many: ['ingredients'] }));
	}
}

export const suppliers_service = new SuppliersService();
