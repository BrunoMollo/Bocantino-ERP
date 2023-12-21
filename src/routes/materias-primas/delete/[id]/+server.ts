import { deletebyID } from '$lib/server/logic/ingredients';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ params }) => {
	if (params.id != undefined) {
		const id: number = Number(params.id);
		await deletebyID(id);
	}
	return new Response();
};


