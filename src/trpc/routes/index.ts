import { t } from '$trpc/init';
import { z } from 'zod';
import { ingredient } from './ingredients';
export default t.router({
	ingredient,
	welcome: t.procedure.input(z.string()).query(({ input }) => {
		return `hello ${input}`;
	})
});

