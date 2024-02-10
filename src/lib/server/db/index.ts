import { NEON_DATABASE_URL } from '$env/static/private';
import { dev } from '$app/environment';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzle_neon, type NeonQueryResultHKT } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import type { ExtractTablesWithRelations } from 'drizzle-orm';

import { drizzle as dizzle_local } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function create_neon_db_client() {
	neonConfig.webSocketConstructor = ws; // <-- this is the key bit

	const pool = new Pool({ connectionString: NEON_DATABASE_URL });
	pool.on('error', (err) => console.error(err)); // deal with e.g. re-connect

	const client = await pool.connect();
	return drizzle_neon(client, { logger: dev });
}

export function create_docker_db_client() {
	const migrationClient = postgres(NEON_DATABASE_URL, { max: 1 });
	migrate(dizzle_local(migrationClient), { migrationsFolder: 'migrations' });

	const queryClient = postgres(NEON_DATABASE_URL);
	return dizzle_local(queryClient);
}

export type Db = Awaited<ReturnType<typeof create_neon_db_client>>;
//@ts-ignore
export const db: Db = dev ? create_docker_db_client() : await create_neon_db_client();

export type Tx = PgTransaction<
	NeonQueryResultHKT,
	Record<string, never>,
	ExtractTablesWithRelations<Record<string, never>>
>;

