import { t } from '$trpc/init';
import { z } from 'zod';
import { ingredient } from './ingredients';
import { entries } from './entries';
export default t.router({
	ingredient,
	entries
});

