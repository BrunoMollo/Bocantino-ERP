import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const t_ingredient = sqliteTable('ingredient', {
	id: integer('id').notNull().primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	unit: text('unit').notNull()
})


