import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

export const mockDrizzleClient = new Database(':memory:');

export const db = drizzle(mockDrizzleClient, { schema });
migrate(db, { migrationsFolder: 'migrations' });

export const INVOICE_TYPE = { id: 1, desc: 'invoice' };

