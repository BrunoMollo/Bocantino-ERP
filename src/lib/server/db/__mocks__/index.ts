import * as schema from '../schema';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

export const mockDrizzleClient = createClient({ url: 'http://127.0.0.1:8080' });

export const db = drizzle(mockDrizzleClient, { schema });

export const INVOICE_TYPE = { id: 1, desc: 'invoice' };

