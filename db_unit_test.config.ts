import type { Config } from 'drizzle-kit';

export default {
	schema: 'src/lib/server/db/schema.ts',
	driver: 'pg',
	dbCredentials: {
		connectionString: 'postgresql://postgres:postgres@localhost:5432/mydatabase'
	}
} satisfies Config;

