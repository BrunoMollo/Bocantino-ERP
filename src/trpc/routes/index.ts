import { t } from '$trpc/init';
import { ingredient } from './ingredients';
import { entries } from './entries';
export default t.router({
	ingredient,
	entries
});

