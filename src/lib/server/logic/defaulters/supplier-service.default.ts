import { suppliers_service } from '$logic/suppliers-service';

class SuppliersServiceDefulter {
	async add({ ingredientsIds }: { ingredientsIds: number[] }) {
		return await suppliers_service
			.add({
				name: 'Juan Provide',
				email: 'prov@prov.com',
				cuit: '123456789',
				phone_number: '3364123456',
				address: 'Fake Street 123',
				ingredientsIds
			})
			.then((x) => x.id);
	}
}

export const suppliers_defaulter_service = new SuppliersServiceDefulter();

