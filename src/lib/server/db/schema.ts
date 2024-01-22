import {
	date,
	foreignKey,
	integer,
	pgTable,
	primaryKey,
	real,
	serial,
	text,
	timestamp,
	varchar
} from 'drizzle-orm/pg-core';

////-------------------------------------------------------------------------------------//
// INGREDIENTS
export const t_ingredient = pgTable('ingredient', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	unit: text('unit').notNull().$type<'gr' | 'Kg'>(),
	reorderPoint: real('reorder_point').notNull()
});
export const tr_ingredient_ingredient = pgTable('r_ingredient_ingredient', {
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
export const t_product = pgTable('product', {
	id: serial('id').primaryKey(),
	desc: text('desc').notNull()
});
//-------------------------------------------------------------------------------------////
//

////-------------------------------------------------------------------------------------//
// INGREDIENTS <-> PRODUCTS
export const tr_ingredient_product = pgTable(
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
export const t_supplier = pgTable('supplier', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull()
});
//-------------------------------------------------------------------------------------////
//

////-------------------------------------------------------------------------------------//
// SUPPLIER <-> INGREDIENTS
export const tr_supplier_ingredient = pgTable(
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
// INGREDIENT BATCH
export const t_ingredient_batch = pgTable(
	'ingredient_batch',
	{
		id: serial('id').primaryKey(),
		batch_code: text('supplier_bag_code').notNull(), //may or may not be provided by the supplier
		initialAmount: real('full_amount').notNull(),
		productionDate: date('production_date', { mode: 'date' }), // is null when is IN_PRODUCTION
		ingredientId: integer('ingredient_id')
			.notNull()
			.references(() => t_ingredient.id),
		numberOfBags: integer('amount_of_bags').notNull(),
		state: text('state').notNull().$type<'IN_PRODUCTION' | 'AVAILABLE' | 'EMPTY'>(),
		registration_date: timestamp('registration_date', { mode: 'date' })
			.notNull()
			.$defaultFn(() => new Date()),
		//external only
		supplierId: integer('supplier_id'),
		expiration_date: date('expiration_date', { mode: 'date' }),
		cost: integer('cost'),
		currency_alpha_code: varchar('currency_alpha_code', { length: 4 })
			.notNull()
			.$defaultFn(() => 'ARG'),
		entry_id: integer('entry_id').references(() => t_ingridient_entry.id),
		iva_tax: real('iva_tax').notNull(),
		perceptions_tax: real('perceptions_tax').notNull(),
		//internal only
		adjustment: real('adjustment')
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
// INGREDIENT BATCH (derived)<--> INGREDIENT BATCH (used)
export const tr_ingredient_batch_ingredient_batch = pgTable(
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
export const t_ingridient_entry = pgTable('ingridient_entry', {
	id: serial('id').primaryKey(),
	creation_date: timestamp('creation_date', { mode: 'date' })
		.notNull()
		.$defaultFn(() => new Date()),
	totalCost: integer('total_cost'), // is calulated later, so can be null
	currency_alpha_code: varchar('currency_alpha_code', { length: 4 })
		.notNull()
		.$defaultFn(() => 'ARG'),
	documentId: integer('document_id').references(() => t_entry_document.id),
	supplierId: integer('supplier_id')
		.notNull()
		.references(() => t_supplier.id)
});
export const t_entry_document = pgTable('entry_document', {
	id: serial('id').primaryKey(),
	number: text('document_identifier').notNull(),
	issue_date: date('issue_date', { mode: 'date' }).notNull(),
	due_date: date('due_date', { mode: 'date' }).notNull(),
	typeId: integer('type_id')
		.notNull()
		.references(() => t_document_type.id)
});
//-------------------------------------------------------------------------------------////
//

////-------------------------------------------------------------------------------------//
// DOCUMENT TYPE
export const t_document_type = pgTable('document_type', {
	id: serial('id').primaryKey(),
	desc: text('description').notNull()
});
//-------------------------------------------------------------------------------------////
//

////-------------------------------------------------------------------------------------//
// USER
export const t_user = pgTable('user', {
	id: serial('id').primaryKey(),
	username: text('username').notNull().unique(),
	password_hash: text('password_hash').notNull()
});
//-------------------------------------------------------------------------------------////
//

////-------------------------------------------------------------------------------------//
// PRODUCT BATCH
export const t_product_batch = pgTable('product_batch', {
	id: serial('id').primaryKey(),
	batch_code: text('supplier_bag_code').notNull(),
	initial_amount: real('full_amount').notNull(),
	expiration_date: date('expiration_date', { mode: 'date' }).notNull(),
	production_date: date('production_date', { mode: 'date' }), // is null when is IN_PRODUCTION
	product_id: integer('product_id')
		.notNull()
		.references(() => t_product.id),
	state: text('state').notNull().$type<'IN_PRODUCTION' | 'AVAILABLE' | 'EMPTY'>(),
	registration_date: timestamp('registration_date', { mode: 'date' })
		.notNull()
		.$defaultFn(() => new Date()),
	adjustment: real('adjustment')
});
//-------------------------------------------------------------------------------------////
//

////-------------------------------------------------------------------------------------//
// PRODUCT BATCH <--> INGREDIENT BATCH
export const tr_product_batch_ingredient_batch = pgTable(
	'r_product_batch_ingredient_batch',
	{
		produced_batch_id: integer('product_batch_id')
			.notNull()
			.references(() => t_product_batch.id),
		ingredient_batch_id: integer('ingredient_batch_id')
			.notNull()
			.references(() => t_ingredient_batch.id),
		amount_used_to_produce_batch: real('amount_used').notNull()
	},
	({ produced_batch_id, ingredient_batch_id }) => ({
		pk: primaryKey({ columns: [produced_batch_id, ingredient_batch_id] })
	})
);
//-------------------------------------------------------------------------------------////
//

