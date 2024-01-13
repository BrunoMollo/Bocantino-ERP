import { foreignKey, integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

////-------------------------------------------------------------------------------------//
// INGREDIENTS
export const t_ingredient = sqliteTable('ingredient', {
	id: integer('id').notNull().primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	unit: text('unit').notNull().$type<'gr' | 'Kg'>(),
	reorderPoint: integer('reorder_point').notNull()
});
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
		ingredientId: integer('ingredient_id')
			.notNull()
			.references(() => t_ingredient.id)
	},
	({ supplierId, ingredientId }) => ({
		pk: primaryKey({ columns: [supplierId, ingredientId] })
	})
);
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
		productionDate: integer('production_date', { mode: 'timestamp' }), // is null when is IN_PRODUCTION
		ingredientId: integer('ingredient_id')
			.notNull()
			.references(() => t_ingredient.id),
		numberOfBags: integer('amount_of_bags').notNull(),
		state: text('state').notNull().$type<'IN_PRODUCTION' | 'AVAILABLE' | 'EMPTY'>(),
		registration_date: integer('registration_date', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date()),
		//external only
		supplierId: integer('supplier_id'),
		expiration_date: integer('expiration_date', { mode: 'timestamp' }),
		cost: integer('cost'),
		currency_alpha_code: text('currency_alpha_code', { length: 4 })
			.notNull()
			.$defaultFn(() => 'ARG'),
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
//-------------------------------------------------------------------------------------////
//

////-------------------------------------------------------------------------------------//
// INGREDIENT BAG (derived)<--> INGREDIENT BAG (used)
export const tr_ingredient_batch_ingredient_batch = sqliteTable(
	'r_ingredient_batch_ingredient_batch',
	{
		produced_batch_id: integer('produced_batch_id')
			.notNull()
			.references(() => t_ingredient_batch.id),
		used_batch_id: integer('used_batch_id')
			.notNull()
			.references(() => t_ingredient_batch.id),
		amount_used_to_produce_batch: real('amount_used').notNull()
	},
	({ produced_batch_id, used_batch_id }) => ({
		pk: primaryKey({ columns: [produced_batch_id, used_batch_id] })
	})
);
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
	currency_alpha_code: text('currency_alpha_code', { length: 4 })
		.notNull()
		.$defaultFn(() => 'ARG'),
	documentId: integer('document_id').references(() => t_entry_document.id),
	supplierId: integer('supplier_id')
		.notNull()
		.references(() => t_supplier.id)
});
export const t_entry_document = sqliteTable('entry_document', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	number: text('document_identifier').notNull(),
	issue_date: integer('issue_date', { mode: 'timestamp' }).notNull(),
	typeId: integer('type_id')
		.notNull()
		.references(() => t_document_type.id)
});
//-------------------------------------------------------------------------------------////
//

////-------------------------------------------------------------------------------------//
// DOCUMENT TYPE
export const t_document_type = sqliteTable('document_type', {
	id: integer('id').notNull().primaryKey({ autoIncrement: true }),
	desc: text('description').notNull()
});
//-------------------------------------------------------------------------------------////
//

////-------------------------------------------------------------------------------------//
// USER
export const t_user = sqliteTable('user', {
	id: integer('id').notNull().primaryKey({ autoIncrement: true }),
	username: text('username').notNull().unique(),
	password_hash: text('password_hash').notNull()
});
//-------------------------------------------------------------------------------------////
//

