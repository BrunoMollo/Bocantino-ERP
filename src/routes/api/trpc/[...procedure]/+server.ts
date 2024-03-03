import { createSvelteKitContext } from '$lib/server/trpc/context';
import { appRouter } from '$lib/server/trpc/routes';
import type { RequestHandler } from '@sveltejs/kit';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

export const GET = ((event) =>
	fetchRequestHandler({
		req: event.request,
		router: appRouter,
		endpoint: '/api/trpc',
		createContext: createSvelteKitContext(event.locals)
	})) satisfies RequestHandler;

export const POST = ((event) =>
	fetchRequestHandler({
		req: event.request,
		router: appRouter,
		endpoint: '/api/trpc',
		createContext: createSvelteKitContext(event.locals)
	})) satisfies RequestHandler;

