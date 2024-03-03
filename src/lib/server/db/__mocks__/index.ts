import { NEON_DATABASE_URL } from '$env/static/private';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const uri = NEON_DATABASE_URL;

const queryClient = postgres(uri);
export const db = drizzle(queryClient);

export const INVOICE_TYPE = { id: 1, desc: 'invoice' };

