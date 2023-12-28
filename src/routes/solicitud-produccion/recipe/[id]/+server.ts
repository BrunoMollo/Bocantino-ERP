import { ingredients_service } from '$logic';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	if (params.id != undefined) {
		const id: number = Number(params.id);
		const recipe = await ingredients_service.getRecipie(id);
		return json(recipe ?? { mjs: 'doesnt have recipe' });
	}
	return json({ msj: 'invalid request' }, { status: 400 });
};
