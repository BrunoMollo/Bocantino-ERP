import { NEON_DATABASE_URL } from '$env/static/private';
import { dev } from '$app/environment';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle, type NeonQueryResultHKT } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import type { ExtractTablesWithRelations } from 'drizzle-orm';

// Configure Neon for Lambda serverless environments
if (typeof WebSocket === 'undefined') {
	// Only use ws polyfill if WebSocket is not available
	neonConfig.webSocketConstructor = ws;
}
neonConfig.poolQueryViaFetch = true; // Prefer HTTP over WebSocket for Lambda
neonConfig.useSecureWebSocket = true;
neonConfig.fetchConnectionCache = true; // Enable connection caching for better Lambda performance

// Create a connection pool but don't connect immediately
let pool: Pool | undefined;
let db: ReturnType<typeof drizzle> | undefined;

// Lazy initialization function for Lambda compatibility
function getDb() {
	if (!db) {
		if (!pool) {
			pool = new Pool({ 
				connectionString: NEON_DATABASE_URL,
				// Configure for Lambda environment
				max: 1, // Single connection for Lambda
				idleTimeoutMillis: 30000,
				connectionTimeoutMillis: 5000,
			});
			
			pool.on('error', (err) => {
				console.error('Database pool error:', err);
				// Reset connections on error
				pool = undefined;
				db = undefined;
			});
		}
		
		db = drizzle(pool, { 
			logger: dev,
			// Configure for serverless
			casing: 'snake_case'
		});
	}
	return db;
}

// Graceful cleanup function for Lambda
export async function closeDb() {
	if (pool) {
		await pool.end();
		pool = undefined;
		db = undefined;
	}
}

// Export the lazy getter
export { getDb as db };

export type Db = ReturnType<typeof getDb>;

export type Tx = PgTransaction<
	NeonQueryResultHKT,
	Record<string, never>,
	ExtractTablesWithRelations<Record<string, never>>
>;

