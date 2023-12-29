import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server/trpc/routes';

export const trpc = createTRPCProxyClient<AppRouter>({
	links: [httpBatchLink({ url: '/api/trpc' })]
});

export const trpcOnServer = (fetch: any) =>
	createTRPCProxyClient<AppRouter>({
		links: [
			httpBatchLink({
				url: '/api/trpc',
				fetch
			})
		]
	});

