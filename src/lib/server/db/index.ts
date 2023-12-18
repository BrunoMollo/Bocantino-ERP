import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { TURSO_TOKEN, TURSO_URL } from '$env/static/private';
import * as schema from './schema';
import { dev } from '$app/environment';

const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });
export const db = drizzle(client, { schema, logger: dev });

