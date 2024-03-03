import { purchases_service } from '$logic/ingredient-purchase-service';
import { error } from '@sveltejs/kit';
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

