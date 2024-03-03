import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

const { NEON_DATABASE_URL } = process.env;
if (!NEON_DATABASE_URL) {
	throw new Error('Define NEON_DATABASE_URL in .env file');
}

export default {
	schema: 'src/lib/server/db/schema.ts',
	out: 'migrations',
	driver: 'pg',
	dbCredentials: {
		connectionString: NEON_DATABASE_URL
	}
} satisfies Config;
