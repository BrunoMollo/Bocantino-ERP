import { TRPC } from '@sveltering/shtz/server';

export const t = new TRPC({
	path: '/trpc',

	context: async function (event) {
		return {}; //TODO: add user to context
	}
});

