import { INVOICE_TYPE } from '$lib/server/db/__mocks__';
import { purchases_service } from '$logic/ingredient-purchase-service';

class PurchaseServiceDefaulter {
	async buy(obj: {
		supplier_id: number;
		bought: Array<{ ingredient_id: number; initial_amount: number }>;
	}) {
		const { supplier_id, bought } = obj;

		const batches = bought.map((x) => ({
			ingredient_id: x.ingredient_id,
			batch_code: 'SOME CODE',
			initial_amount: x.initial_amount,
			number_of_bags: 10,
			cost: 1000,
			production_date: new Date(),
			expiration_date: new Date()
		}));
		return await purchases_service
			.registerBoughtIngrediets({
				withdrawal_tax_amount: 10,
				iva_tax_percentage: 21,
				supplier_id,
				document: {
					number: '1234',
					typeId: INVOICE_TYPE.id,
					issue_date: new Date(),
					due_date: new Date()
				},
				batches
			})
			.then((x) => x.batchesId);
	}
}

export const purchases_defaulter_service = new PurchaseServiceDefaulter();
