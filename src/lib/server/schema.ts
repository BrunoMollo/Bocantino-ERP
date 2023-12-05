import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";


export const tipoMateriaPrima = sqliteTable('tipo_materia_prima', {
	id: integer('id').notNull().primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	unit: text('unit').notNull()
})

