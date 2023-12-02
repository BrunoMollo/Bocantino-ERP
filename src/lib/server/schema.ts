import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";


export const ingredients = sqliteTable('ingridients', {
	id: integer('id').notNull().primaryKey({ autoIncrement: true }),
	name: text('name').notNull()
})

