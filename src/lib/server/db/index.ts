import { NEON_DATABASE_URL, TURSO_TOKEN, TURSO_URL } from '$env/static/private';
import type * as schema from './schema';
import { dev } from '$app/environment';
import { Pool, neon, neonConfig } from '@neondatabase/serverless';
import type { NeonTransaction } from 'drizzle-orm/neon-http';
import { drizzle, type NeonQueryResultHKT } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import type { ExtractTablesWithRelations } from 'drizzle-orm';

// const client = neon(NEON_DATABASE_URL);
// export const db = drizzle(client, { schema, logger: dev });

neonConfig.webSocketConstructor = ws; // <-- this is the key bit

const pool = new Pool({ connectionString: NEON_DATABASE_URL });
pool.on('error', (err) => console.error(err)); // deal with e.g. re-connect

const client = await pool.connect();

export const db = drizzle(client, { logger: dev });

export type Db = typeof db;

export type Tx = PgTransaction<
	NeonQueryResultHKT,
	Record<string, never>,
	ExtractTablesWithRelations<Record<string, never>>
>;

