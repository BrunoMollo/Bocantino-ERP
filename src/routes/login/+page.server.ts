import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/client';

const login_schema = z.object({
	username: z.string().min(3).max(255),
	password: z.string().min(3).max(255)
});

export const load: PageServerLoad = async () => {
	const form = superValidate(login_schema);
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, login_schema);
		if (!form.valid) {
			return { form };
		}
		console.log(form.data);

		return { form };
	}
};

