import { auth_service } from '$logic/auth-service';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname === '/login' || event.url.pathname == '/-dev') {
		return await resolve(event);
	}

	const token = event.cookies.get('token');

	if (!token) {
		return hook_redirect('/login');
	}

	const res = await auth_service.verifyJWT(token);

	if (res.type == 'AUTH_ERROR') {
		return hook_redirect('/login');
	}

	event.locals.user = res.payload;

	if (event.url.pathname === '/') {
		return hook_redirect('/bocantino');
	}

	const respose = await resolve(event);
	return respose;
};

/** custom redirect */
function hook_redirect(location: string) {
	return new Response(undefined, {
		status: 303,
		headers: { location }
	});
}

