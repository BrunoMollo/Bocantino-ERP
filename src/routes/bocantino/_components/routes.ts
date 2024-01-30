export type Route = { name: string; href: string; icon: string };

export const routes = [
	{
		name: 'Producción',
		icon: 'bxs-grid-alt',
		routes: [
			{
				name: 'Ingreso insumos',
				href: '/bocantino/ingreso-insumos',
				icon: 'bx bxs-archive-in text-xl'
			},
			{
				name: 'Listado ingresos',
				href: '/bocantino/insumos-ingresados',
				icon: 'bx bx-list-ul text-xl'
			},
			{
				name: 'Producir ingrediente',
				href: '/bocantino/producir-ingrediente',
				icon: 'bx text-xl bx-file'
			},

			{
				name: 'Producir producto',
				href: '/bocantino/producir-producto',
				icon: 'bx text-xl bx-file'
			},
			{
				name: 'Producciones pendientes',
				href: '/bocantino/solicitudes-pendientes',
				icon: 'bx bx-list-check'
			},
			{ name: 'Lotes', href: '/bocantino/lotes', icon: 'bx bx-list-check' }
		] satisfies Route[]
	},

	{
		name: 'Configuracion',
		icon: 'bx-cog',
		routes: [
			{ name: 'Materias Primas', href: '/bocantino/materias-primas', icon: 'bx-vial' },
			{ name: 'Proveedores', href: '/bocantino/proveedores', icon: 'bx-group ' },
			{ name: 'Productos', href: '/bocantino/productos', icon: 'bx-package ' }
		] satisfies Route[]
	}
];

