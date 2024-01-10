import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname === '/') {
		throw redirect(302, '/bocantino');
	}
	const respose = await resolve(event);
	return respose;
};

