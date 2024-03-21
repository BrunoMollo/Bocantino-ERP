import { z } from 'zod';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/client';

const edit_entry_schema = z.object({});

export const load: PageServerLoad = async () => {
	const form = superValidate(edit_entry_schema);
	return { form };
};
