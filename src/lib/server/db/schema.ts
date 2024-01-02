import { relations } from 'drizzle-orm';
import { foreignKey, integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

////-------------------------------------------------------------------------------------//
// INGREDIENTS
export const t_ingredient = sqliteTable('ingredient', {
	id: integer('id').notNull().primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	unit: text('unit').notNull().$type<'Gramos' | 'Kilogramos'>(),
	reorderPoint: integer('reorder_point').notNull()
});
export const rel_ingredient = relations(t_ingredient, ({ many }) => ({
	r_ingredient_product: many(tr_ingredient_product),
	r_supplier_ingredient: many(tr_supplier_ingredient),
	r_ingredient_ingredient: many(tr_ingredient_ingredient)
}));
export const tr_ingredient_ingredient = sqliteTable('r_ingredient_ingredient', {
	amount: real('amount').notNull(),
	derivedId: integer('derived_id')
		.notNull()
		.references(() => t_ingredient.id),
	sourceId: integer('source_id')
		.notNull()
		.references(() => t_ingredient.id)
});
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
		amount: real('amount').notNull()
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
export const t_ingredient_batch = sqliteTable(
	'ingredient_batch',
	{
		id: integer('id').notNull().primaryKey({ autoIncrement: true }),
		batch_code: text('supplier_bag_code').notNull(), //may or may not be provided by the supplier
		initialAmount: real('full_amount').notNull(),
		usedAmount: real('used_amount').notNull().default(0),
		to_be_used_amount: real('to_be_used_amount').notNull().default(0),
		productionDate: integer('production_date', { mode: 'timestamp' }).notNull(),
		expirationDate: integer('expiration_date', { mode: 'timestamp' }).notNull(),
		ingredientId: integer('ingredient_id')
			.notNull()
			.references(() => t_ingredient.id),
		numberOfBags: integer('amount_of_bags').notNull(),
		state: text('state').notNull().$type<'IN_PRODUCTION' | 'AVAILABLE' | 'EMPTY'>(),
		//external only
		supplierId: integer('supplier_id'),
		cost: integer('cost'),
		currency_alpha_code: text('currency_alpha_code', { length: 4 }).notNull().default('ARG'),
		entry_id: integer('entry_id').references(() => t_ingridient_entry.id),
		//internal only
		loss: real('loss')
	},
	({ supplierId, ingredientId }) => ({
		unq: foreignKey({
			columns: [supplierId, ingredientId],
			foreignColumns: [tr_supplier_ingredient.supplierId, tr_supplier_ingredient.ingredientId]
		})
	})
);
export const rel_ingredient_batch = relations(t_ingredient_batch, ({ one }) => ({
	entry: one(t_ingridient_entry),
	supplier: one(t_supplier, {
		fields: [t_ingredient_batch.supplierId],
		references: [t_supplier.id]
	}),
	ingredient: one(t_ingredient, {
		fields: [t_ingredient_batch.ingredientId],
		references: [t_ingredient.id]
	})
}));
//-------------------------------------------------------------------------------------////
//

////-------------------------------------------------------------------------------------//
// INGRIDEINT ENTRY
export const t_ingridient_entry = sqliteTable('ingridient_entry', {
	id: integer('id').notNull().primaryKey({ autoIncrement: true }),
	creation_date: integer('creation_date', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	totalCost: integer('total_cost'), // is calulated later, so can be null
	currency_alpha_code: text('currency_alpha_code', { length: 4 }).notNull().default('ARG'),
	documentId: integer('document_id').references(() => t_entry_document.id),
	supplierId: integer('supplier_id')
		.notNull()
		.references(() => t_supplier.id)
});
export const rel_ingredient_entry = relations(t_ingridient_entry, ({ one }) => ({
	doc: one(t_entry_document),
	supplier: one(t_supplier)
}));
export const t_entry_document = sqliteTable('entry_document', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	number: text('document_identifier').notNull(),
	issue_date: integer('issue_date', { mode: 'timestamp' }).notNull(),
	typeId: integer('type_id')
		.notNull()
		.references(() => t_document_type.id)
});
export const rel_entry_docuement = relations(t_entry_document, ({ one }) => ({
	type: one(t_document_type)
}));
export const t_document_type = sqliteTable('document_type', {
	id: integer('id').notNull().primaryKey({ autoIncrement: true }),
	desc: text('description').notNull()
});
//-------------------------------------------------------------------------------------////
//

