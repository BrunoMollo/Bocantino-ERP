import { relations } from 'drizzle-orm';
import { foreignKey, integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

////-------------------------------------------------------------------------------------//
// INGREDIENTS
export const t_ingredient = sqliteTable('ingredient', {
	id: integer('id').notNull().primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	unit: text('unit').notNull()
});
export const rel_ingredient = relations(t_ingredient, ({ many }) => ({
	r_ingredient_product: many(tr_ingredient_product),
	r_supplier_ingredient: many(tr_supplier_ingredient)
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
export const rel_supplier = relations(t_supplier, ({ many }) => ({
	r_supplier_ingredient: many(tr_supplier_ingredient)
}));
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
		ingredientId: integer('ingredient_id')
			.notNull()
			.references(() => t_ingredient.id)
	},
	({ supplierId, ingredientId }) => ({
		pk: primaryKey({ columns: [supplierId, ingredientId] })
	})
);
export const rel_supplier_ingredient = relations(tr_supplier_ingredient, ({ one }) => ({
	ingredient: one(t_ingredient, {
		fields: [tr_supplier_ingredient.ingredientId],
		references: [t_ingredient.id]
	}),
	supplier: one(t_supplier, {
		fields: [tr_supplier_ingredient.supplierId],
		references: [t_supplier.id]
	})
}));
//-------------------------------------------------------------------------------------////
//
//

////-------------------------------------------------------------------------------------//
// INGREDIENT BAG
export const t_ingredient_bag = sqliteTable(
	'ingredient_bag',
	{
		id: integer('id').notNull().primaryKey({ autoIncrement: true }),
		supplier_bag_code: text('supplier_bag_code'), //may or may not be provided by the supplier
		fullAmount: real('full_amount').notNull(),
		supplierId: integer('supplier_id').notNull(),
		ingredientId: integer('ingredient_id').notNull()
	},
	({ supplierId, ingredientId }) => ({
		unq: foreignKey({
			columns: [supplierId, ingredientId],
			foreignColumns: [tr_supplier_ingredient.supplierId, tr_supplier_ingredient.ingredientId]
		})
	})
);
export const rel_ingredient_bag = relations(t_ingredient_bag, ({ one }) => ({
	supplier: one(t_supplier, {
		fields: [t_ingredient_bag.supplierId],
		references: [t_supplier.id]
	}),
	ingredient: one(t_ingredient, {
		fields: [t_ingredient_bag.ingredientId],
		references: [t_ingredient.id]
	})
}));
//-------------------------------------------------------------------------------------////
//

////-------------------------------------------------------------------------------------//
// PURCHASE INVOICE
export const t_purchase_invoice = sqliteTable('purchase_invoice', {
	id: integer('id').notNull().primaryKey({ autoIncrement: true }),
	invoice_number: text('invoice_number').notNull(),
	issue_date: integer('issue_date', { mode: 'timestamp' }).notNull(),
	total: integer('total').notNull(),
	currency_alpha_code: text('currency_alpha_code', { length: 4 }).notNull().default('ARG'),
	creation_date: integer('creation_date', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});
//-------------------------------------------------------------------------------------////
//
