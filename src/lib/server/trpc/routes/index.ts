import { ingredient } from './ingredients';
import { entries } from './entries';
import { router } from '../context';
export const appRouter = router({
	ingredient,
	entries
});

export type AppRouter = typeof appRouter;

