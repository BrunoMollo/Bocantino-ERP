import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const proveedores = [
		{ nombre: 'Proveedor1', email: 'Proveedor1@gmail.com', materias: ['Papa', 'Zapallo'] },
		{
			nombre: 'Proveedor2',
			email: 'Proveedor2@gmail.com',
			materias: ['Zanahoria', 'Huevos', 'Harina']
		},
		{
			nombre: 'Proveedor3',
			email: 'Proveedor3@gmail.com',
			materias: ['Papa', 'Zapallo', 'Huevos']
		},
		{
			nombre: 'Proveedor4',
			email: 'Proveedor4@gmail.com',
			materias: ['Papas']
		}
	];

	return { proveedores, saludos: 'hola' };
};
