import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();
const { TURSO_UNIT_TEST_URL, TURSO_UNIT_TEST_TOKEN } = process.env;
if (!TURSO_UNIT_TEST_URL || !TURSO_UNIT_TEST_TOKEN) {
	throw new Error('Define TURSO_URL and TURSO_TOKEN in .env file');
}

export default {
	schema: 'src/lib/server/db/schema.ts',
	driver: 'turso',
	dbCredentials: {
		url: TURSO_UNIT_TEST_URL,
		authToken: TURSO_UNIT_TEST_TOKEN
	}
} satisfies Config;
