import { purchases_service } from '$logic/ingredient-purchase-service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const page = Number(url.searchParams.get('page')) || 0;
	const supplierName = url.searchParams.get('supplier') ?? '';
	const documentNumber = url.searchParams.get('number') ?? '';
	const dateInitial = url.searchParams.get('dateInitial') || undefined;
	const dateFinal = url.searchParams.get('dateFinal') || undefined;
	const count_entries = await purchases_service
		.getCountOfAvailableEntries({
			supplierName,
			page,
			documentNumber,
			dateInitial,
			dateFinal
		})
		.then((x) => x[0]?.value);
	const entries = await purchases_service.getEntries({
		supplierName,
		page,
		documentNumber,
		dateInitial,
		dateFinal
	});
	const page_size = purchases_service.PAGE_SIZE;
	return { entries, page_size, count_entries };
};
