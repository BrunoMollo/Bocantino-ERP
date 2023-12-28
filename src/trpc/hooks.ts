import { t } from '$trpc/init';
import router from '$trpc/routes';

export type Router = typeof router;
export const handeleHook = t.hookCreate(router);

