import { ingredient } from './ingredients';
import { entries } from './entries';
import { router } from '../context';
import { products } from './products';
export const appRouter = router({
	ingredient,
	entries,
	products
});

export type AppRouter = typeof appRouter;
