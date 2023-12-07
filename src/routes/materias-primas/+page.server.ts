import type { PageServerLoad } from './$types';
import { db } from '$lib';
import { t_ingredient } from '$lib/server/schema';

export const load: PageServerLoad = async ({}) => {
	const list = await db.select().from(t_ingredient);
	return { list };
};
