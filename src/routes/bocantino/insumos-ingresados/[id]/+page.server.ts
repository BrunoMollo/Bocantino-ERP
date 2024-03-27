import { purchases_service } from '$logic/ingredient-purchase-service';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';



export const load: PageServerLoad = async (url) => {
	const id = Number(url.params.id);
	if (!id) {
		throw error(400, 'id invalido');
	}
	const entry = await purchases_service.getEntryById(id);
	if (!entry) {
		throw error(404, 'entrada no encontrada');
	}
	return { entry };
};

export const actions = {
	remove: async ({ params }) => {
		const id = Number(params.id);
		const res = await purchases_service.deleteEntryById(id);
		if (res.type == 'SUCCESS') {
			throw redirect(302, '/bocantino/insumos-ingresados');
		} else {
			throw error(400, res.message);
		};
	}
}
