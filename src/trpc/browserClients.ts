import { PUBLIC_SITE_URL } from '$env/static/public';
import { browserClientCreate, type ProcedureReturnType } from '@sveltering/shtz/browser';
import type { Router } from '$trpc/hooks';

export const trpcClient = browserClientCreate<Router>({
	url: PUBLIC_SITE_URL + '/trpc'
});

export type { ProcedureReturnType };

