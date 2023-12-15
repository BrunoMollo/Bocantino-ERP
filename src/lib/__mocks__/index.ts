import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '$lib/server/schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

export const mockDrizzleClient = new Database(':memory:');

export const db = drizzle(mockDrizzleClient, { schema });
migrate(db, { migrationsFolder: 'drizzle' });

