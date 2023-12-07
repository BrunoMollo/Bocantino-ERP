import { relations } from 'drizzle-orm';
import { primaryKey, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

////-------------------------------------------------------------------------------------//
// INGREDIENTS
export const t_ingredient = sqliteTable('ingredient', {
	id: integer('id').notNull().primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	unit: text('unit').notNull()
});
export const rel_ingredient = relations(t_ingredient, ({ many }) => ({
	r_ingredient_product: many(tr_ingredient_product)
}));
//-------------------------------------------------------------------------------------////
//

////-------------------------------------------------------------------------------------//
// PRODUCTS
export const t_product = sqliteTable('product', {
	id: integer('id').notNull().primaryKey({ autoIncrement: true }),
	desc: text('desc').notNull()
});
export const rel_product = relations(t_product, ({ many }) => ({
	r_ingredient_product: many(tr_ingredient_product)
}));
//-------------------------------------------------------------------------------------////
//

////-------------------------------------------------------------------------------------//
// INGREDIENTS <-> PRODUCTS
export const tr_ingredient_product = sqliteTable(
	'r_ingredient_product',
	{
		ingredientId: integer('ingredient_id')
			.notNull()
			.references(() => t_ingredient.id),
		productId: integer('product_id')
			.notNull()
			.references(() => t_product.id),
		amount: integer('amount').notNull()
	},
	({ ingredientId, productId }) => ({
		pk: primaryKey({ columns: [ingredientId, productId] })
	})
);
export const rel_ingredient_product = relations(tr_ingredient_product, ({ one }) => ({
	ingredient: one(t_ingredient, {
		fields: [tr_ingredient_product.ingredientId],
		references: [t_ingredient.id]
	}),
	product: one(t_product, {
		fields: [tr_ingredient_product.productId],
		references: [t_product.id]
	})
}));
//-------------------------------------------------------------------------------------////
//

////-------------------------------------------------------------------------------------//
// SUPPLIER
export const t_supplier = sqliteTable('supplier', {
	id: integer('id').notNull().primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	email: text('email').notNull()
});
//-------------------------------------------------------------------------------------////
//

////-------------------------------------------------------------------------------------//
// SUPPLIER <-> INGREDIENTS
export const tr_supplier_ingredient = sqliteTable(
	'r_supplier_ingredient',
	{
		supplierId: integer('supplier_id')
			.notNull()
			.references(() => t_supplier.id),
		ingredientId: integer('integer_id')
			.notNull()
			.references(() => t_ingredient.id)
	},
	({ supplierId, ingredientId }) => ({
		pk: primaryKey({ columns: [supplierId, ingredientId] })
	})
);
export const rel_supplier_ingredient = relations(tr_supplier_ingredient, ({ one }) => ({
	supplier: one(t_supplier, {
		fields: [tr_supplier_ingredient.supplierId],
		references: [t_supplier.id]
	}),
	ingredient: one(t_ingredient, {
		fields: [tr_supplier_ingredient.ingredientId],
		refereces: [t_ingredient.id]
	})
}));
//-------------------------------------------------------------------------------------////
//
