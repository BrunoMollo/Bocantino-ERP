import { drizzle } from 'drizzle-orm/libsql';
import { createClient, type ResultSet } from '@libsql/client';
import { TURSO_TOKEN, TURSO_URL } from '$env/static/private';
import * as schema from './schema';
import { dev } from '$app/environment';
import type { SQLiteTransaction } from 'drizzle-orm/sqlite-core';
import type { ExtractTablesWithRelations } from 'drizzle-orm';

const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });
export const db = drizzle(client, { schema, logger: dev });

export type Tx = SQLiteTransaction<
	'async',
	ResultSet,
	typeof schema,
	ExtractTablesWithRelations<typeof schema>
>;

