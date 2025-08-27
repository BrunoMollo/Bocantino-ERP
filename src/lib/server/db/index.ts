import { NEON_DATABASE_URL } from '$env/static/private';
import { dev } from '$app/environment';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle, type NeonQueryResultHKT } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import type { ExtractTablesWithRelations } from 'drizzle-orm';

// Configure Neon only when needed
if (typeof window === 'undefined') {
	neonConfig.webSocketConstructor = ws;
}

// Lazy database connection
let _db: ReturnType<typeof drizzle> | null = null;

function getDbConnection() {
	if (!_db) {
		if (!NEON_DATABASE_URL) {
			throw new Error('NEON_DATABASE_URL is not defined');
		}
		const pool = new Pool({ connectionString: NEON_DATABASE_URL });
		pool.on('error', (err) => console.error('Database pool error:', err));
		_db = drizzle(pool, { logger: dev });
	}
	return _db;
}

// Export db as a getter function to avoid initialization during import
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
	get(target, prop, receiver) {
		const dbInstance = getDbConnection();
		return Reflect.get(dbInstance, prop, receiver);
	}
});

export type Db = typeof db;

export type Tx = PgTransaction<
	NeonQueryResultHKT,
	Record<string, never>,
	ExtractTablesWithRelations<Record<string, never>>
>;

