import { ingredient_production_service } from '$logic/ingredient-production-service';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const page = Number(url.searchParams.get('page')) || 0; // cant use ??  because of NaN
	const batch_code = url.searchParams.get('batch_code') ?? '';
	const ingredient_name = url.searchParams.get('ingredient_name') ?? '';
	const batches = await ingredient_production_service.getBatchesAvailable({
		page,
		batch_code,
		ingredient_name
	});
	const count_batches = await ingredient_production_service.getCountOfAvailableBatches();
	const page_size = ingredient_production_service.PAGE_SIZE;

	console.log(page_size);
	return { batches, count_batches, page_size };
};

export const actions: Actions = {
	default: async ({ url }) => {
		const batch_code = url.searchParams.get('batch_code') ?? '';
		const ingredient_name = url.searchParams.get('ingredient_name') ?? '';

		let are_more = true;
		let page_number = 0;
		let batches = [] as Awaited<
			ReturnType<typeof ingredient_production_service.getBatchesAvailable>
		>;

		while (are_more) {
			const page = await ingredient_production_service.getBatchesAvailable({
				page: page_number,
				batch_code,
				ingredient_name
			});
			if (page.length === 0) {
				are_more = true;
				break;
			}
			page_number++;
			batches = [...batches, ...page];
		}

		return {
			page_number,
			batches,
			filters: {
				batch_code,
				ingredient_name
			}
		};
	}
};
