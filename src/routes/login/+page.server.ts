import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { message, superValidate } from 'sveltekit-superforms/client';
import { redirect } from '@sveltejs/kit';
import { JWT_EXPIRES_IN } from '$env/static/private';
import { dev } from '$app/environment';
import { auth_service } from '$logic/auth-service';

const login_schema = z.object({
	username: z.string().min(3).max(255),
	password: z.string().min(3).max(255)
});

export const load: PageServerLoad = async () => {
	const form = superValidate(login_schema);
	return { form };
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await superValidate(request, login_schema);
		if (!form.valid) {
			return { form };
		}

		const res = await auth_service.login(form.data);
		if (res.type == 'LOGIC_ERROR') {
			return message(form, 'Credenciales invalidas', { status: 401 }); // don't give to much detail
		}
		const token_max_age = parseInt(JWT_EXPIRES_IN) * 60;

		cookies.set('token', res.token, {
			httpOnly: true,
			path: '/',
			secure: !dev,
			maxAge: token_max_age
		});

		throw redirect(302, '/bocantino');
	}
};

