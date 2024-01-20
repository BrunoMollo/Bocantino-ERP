import { NEON_DATABASE_URL, TURSO_TOKEN, TURSO_URL } from '$env/static/private';
import * as schema from './schema';
import { dev } from '$app/environment';
import { neon } from '@neondatabase/serverless';
import { NeonTransaction, drizzle } from 'drizzle-orm/neon-http';

const client = neon(NEON_DATABASE_URL);
export const db = drizzle(client, { schema, logger: dev });

export type Db = typeof db;

export type Tx = NeonTransaction<typeof schema, any>; //TODO: fix

