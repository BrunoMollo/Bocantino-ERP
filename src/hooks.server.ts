import type { Handle } from '@sveltejs/kit';
import { handeleHook } from '$trpc/hooks';

export const handle: Handle = async ({ event, resolve }) => {
	const TRPCResponse = await handeleHook(event);
	if (TRPCResponse) {
		return TRPCResponse;
	}

	const respose = await resolve(event);
	return respose;
};

