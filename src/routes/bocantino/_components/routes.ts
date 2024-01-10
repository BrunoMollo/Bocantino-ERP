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
				name: 'Solicitud produccion',
				href: '/bocantino/solicitud-produccion',
				icon: 'bx text-xl bx-file'
			},
			{ name: 'Pendientes', href: '/bocantino/solicitudes-pendientes', icon: 'bx bx-list-check' }
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

