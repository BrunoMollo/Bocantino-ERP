import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const uri = 'postgresql://postgres:postgres@localhost:5432/mydatabase';

const queryClient = postgres(uri);
export const db = drizzle(queryClient);

export const INVOICE_TYPE = { id: 1, desc: 'invoice' };

