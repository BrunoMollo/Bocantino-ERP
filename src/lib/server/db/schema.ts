import {
	boolean,
	customType,
	date,
	foreignKey,
	integer,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
	varchar
} from 'drizzle-orm/pg-core';

const recipe_amount = customType<{ data: number }>({
	dataType: () => 'numeric(17, 10)', // eg: 1111111.1111111111
	fromDriver: (value) => Number(value)
});
const stock_amount = customType<{ data: number }>({
	dataType: () => 'numeric(20, 6)', // eg: 11111111111111.111111
	fromDriver: (value) => Number(value)
});
const money_amount = customType<{ data: number }>({
	dataType: () => 'numeric(30, 2)', // eg: 1111111111111111111111111111.11
	fromDriver: (value) => Number(value)
});
const tax_percentage = customType<{ data: number }>({
	dataType: () => 'numeric(10, 4)', // eg: 111111.1111
	fromDriver: (value) => Number(value)
});

////-------------------------------------------------------------------------------------//
// INGREDIENTS
export const t_ingredient = pgTable('ingredient', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	unit: text('unit').notNull().$type<'gr' | 'Kg'>(),
	reorder_point: stock_amount('reorder_point').notNull(),
	nutrient_protein: recipe_amount('protein').notNull(),
	nutrient_carb: recipe_amount('carbs').notNull(),
	nutrient_fat: recipe_amount('fats').notNull(),
	nutrient_humidity: recipe_amount('humidity').notNull(),
	nutrient_fiber: recipe_amount('fiber').notNull(),
	nutrient_ashes: recipe_amount('ashes').notNull(),
	nutrient_calcium: recipe_amount('calcium').notNull(),
	nutrient_sodium: recipe_amount('sodium').notNull(),
	nutrient_phosphorus: recipe_amount('phosphorus').notNull()
});
export const tr_ingredient_ingredient = pgTable(
	'r_ingredient_ingredient',
	{
		id: serial('id'),
		amount: recipe_amount('amount').notNull(),
		derived_id: integer('derived_id')
			.notNull()
			.references(() => t_ingredient.id),
		source_id: integer('source_id')
			.notNull()
			.references(() => t_ingredient.id)
	},
	({ derived_id, source_id }) => ({
		pk: primaryKey({ columns: [derived_id, source_id] })
	})
);
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
		id: serial('id'),
		ingredient_id: integer('ingredient_id')
			.notNull()
			.references(() => t_ingredient.id),
		productId: integer('product_id')
			.notNull()
			.references(() => t_product.id),
		amount: recipe_amount('amount').notNull()
	},
	({ ingredient_id, productId }) => ({
		pk: primaryKey({ columns: [ingredient_id, productId] })
	})
);
//-------------------------------------------------------------------------------------////
//

////-------------------------------------------------------------------------------------//
// SUPPLIER
export const t_supplier = pgTable('supplier', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull(),
	contact_person: text('contact_person'),
	comment: text('comment'),
	cuit: text('cuit').notNull(),
	phone_number: text('phone_number').notNull(),
	address: text('address').notNull()
});
//-------------------------------------------------------------------------------------////
//

////-------------------------------------------------------------------------------------//
// SUPPLIER <-> INGREDIENTS
export const tr_supplier_ingredient = pgTable(
	'r_supplier_ingredient',
	{
		id: serial('id'),
		supplier_id: integer('supplier_id')
			.notNull()
			.references(() => t_supplier.id),
		ingredient_id: integer('ingredient_id')
			.notNull()
			.references(() => t_ingredient.id),
		disabled: boolean('disabled').notNull().default(false)
	},
	({ supplier_id, ingredient_id }) => ({
		pk: primaryKey({ columns: [supplier_id, ingredient_id] })
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
		initial_amount: stock_amount('full_amount').notNull(),
		production_date: date('production_date', { mode: 'date' }), // is null when is IN_PRODUCTION
		ingredient_id: integer('ingredient_id')
			.notNull()
			.references(() => t_ingredient.id),
		number_of_bags: integer('amount_of_bags').notNull(),
		state: text('state').notNull().$type<'IN_PRODUCTION' | 'AVAILABLE' | 'EMPTY'>(),
		registration_date: timestamp('registration_date', { mode: 'date' })
			.notNull()
			.$defaultFn(() => new Date()),
		//external only
		supplier_id: integer('supplier_id'),
		expiration_date: date('expiration_date', { mode: 'date' }),
		cost: money_amount('cost'),
		currency_alpha_code: varchar('currency_alpha_code', { length: 4 })
			.notNull()
			.$defaultFn(() => 'ARG'),
		entry_id: integer('entry_id').references(() => t_ingridient_entry.id),
		iva_tax_percentage: tax_percentage('iva_tax_percentage').notNull(),
		withdrawal_tax_amount: money_amount('withdrawal_tax_amount').notNull(),
		//internal only
		adjustment: stock_amount('adjustment')
	},
	({ supplier_id, ingredient_id }) => ({
		unq: foreignKey({
			columns: [supplier_id, ingredient_id],
			foreignColumns: [tr_supplier_ingredient.supplier_id, tr_supplier_ingredient.ingredient_id]
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
		id: serial('id'),
		produced_batch_id: integer('produced_batch_id')
			.notNull()
			.references(() => t_ingredient_batch.id),
		used_batch_id: integer('used_batch_id')
			.notNull()
			.references(() => t_ingredient_batch.id),
		creation_date: timestamp('creation_date', { mode: 'date' }).$defaultFn(() => new Date()),
		amount_used_to_produce_batch: stock_amount('amount_used').notNull()
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
	total_cost: money_amount('total_cost'), // is calulated later, so can be null
	currency_alpha_code: varchar('currency_alpha_code', { length: 4 })
		.notNull()
		.$defaultFn(() => 'ARG'),
	supplier_id: integer('supplier_id')
		.notNull()
		.references(() => t_supplier.id)
});

export type DocumentType = 'Factura' | 'Remito' | 'Nota de Ingreso';

export const t_entry_document = pgTable('entry_document', {
	id: serial('id').primaryKey(),
	number: text('document_identifier').notNull(),
	issue_date: date('issue_date', { mode: 'date' }),
	due_date: date('due_date', { mode: 'date' }),
	typeId: integer('type_id'), // TODO: rm later
	type: text('document_type').$type<DocumentType>().notNull(),
	creation_date: timestamp('creation_date', { mode: 'date' }).$defaultFn(() => new Date()),
	entry_id: integer('entry_id')
		.notNull()
		.references(() => t_ingridient_entry.id)
});
//-------------------------------------------------------------------------------------////
//

////-------------------------------------------------------------------------------------//
// USER
export const t_user = pgTable('app_user', {
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
	initial_amount: stock_amount('full_amount').notNull(),
	expiration_date: date('expiration_date', { mode: 'date' }).notNull(),
	production_date: date('production_date', { mode: 'date' }), // is null when is IN_PRODUCTION
	creation_date: timestamp('creation_date', { mode: 'date' }).$defaultFn(() => new Date()),
	product_id: integer('product_id')
		.references(() => t_product.id)
		.notNull()
		.references(() => t_product.id),
	state: text('state').notNull().$type<'IN_PRODUCTION' | 'AVAILABLE' | 'EMPTY'>(),
	registration_date: timestamp('registration_date', { mode: 'date' })
		.notNull()
		.$defaultFn(() => new Date()),
	adjustment: stock_amount('adjustment')
});
//-------------------------------------------------------------------------------------////
//

////-------------------------------------------------------------------------------------//
// PRODUCT BATCH <--> INGREDIENT BATCH
export const tr_product_batch_ingredient_batch = pgTable(
	'r_product_batch_ingredient_batch',
	{
		id: serial('id'),
		produced_batch_id: integer('product_batch_id')
			.notNull()
			.references(() => t_product_batch.id),
		ingredient_batch_id: integer('ingredient_batch_id')
			.notNull()
			.references(() => t_ingredient_batch.id),
		creation_date: timestamp('creation_date', { mode: 'date' }).$defaultFn(() => new Date()),
		amount_used_to_produce_batch: stock_amount('amount_used').notNull()
	},
	({ produced_batch_id, ingredient_batch_id }) => ({
		pk: primaryKey({ columns: [produced_batch_id, ingredient_batch_id] })
	})
);
//-------------------------------------------------------------------------------------////
//
