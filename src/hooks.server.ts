import { auth_service } from '$logic/auth-service';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Skip auth for public routes - optimize for Lambda cold starts
	const pathname = event.url.pathname;
	
	if (pathname === '/login' || pathname === '/-dev') {
		return await resolve(event);
	}

	// Root redirect optimization - avoid unnecessary auth check
	if (pathname === '/') {
		return hook_redirect('/bocantino');
	}

	const token = event.cookies.get('token');

	if (!token) {
		return hook_redirect('/login');
	}

	try {
		const res = await auth_service.verifyJWT(token);

		if (res.type === 'AUTH_ERROR') {
			return hook_redirect('/login');
		}

		event.locals.user = res.payload;
	} catch (error) {
		// Handle any JWT verification errors gracefully
		console.error('JWT verification failed:', error);
		return hook_redirect('/login');
	}

	const response = await resolve(event);
	return response;
};

/** Custom redirect optimized for serverless */
function hook_redirect(location: string) {
	return new Response(undefined, {
		status: 303,
		headers: { 
			location,
			// Add cache control for Lambda edge caching optimization
			'Cache-Control': 'no-cache, no-store, must-revalidate'
		}
	});
}

