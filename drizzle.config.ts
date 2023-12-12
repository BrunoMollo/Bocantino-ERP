import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();
const { TURSO_URL, TURSO_TOKEN } = process.env;
if (!TURSO_URL || !TURSO_TOKEN) {
	throw new Error('Define TURSO_URL and TURSO_TOKEN in .env file');
}

export default {
	schema: 'src/lib/server/schema.ts',
	out: 'drizzle',
	driver: 'turso',
	dbCredentials: {
		url: TURSO_URL,
		authToken: TURSO_TOKEN
	}
} satisfies Config;
