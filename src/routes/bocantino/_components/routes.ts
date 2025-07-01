import type { LayoutRouteId } from '../$types';

export type Route = {
	name: string;
	href: LayoutRouteId;
	icon: string;
	omit_from_menu: boolean;
};

// Longer routes have to go last
export const routes = [
	{
		name: 'Producción',
		icon: 'bxs-grid-alt',
		routes: [
			{
				omit_from_menu: true,
				name: 'Dashboard',
				href: '/bocantino',
				icon: 'bx bxs-home text-xl'
			},
			{
				omit_from_menu: false,
				name: 'Ingreso insumos',
				href: '/bocantino/ingreso-insumos',
				icon: 'bx bxs-archive-in text-xl'
			},
			{
				omit_from_menu: true,
				name: 'Ingreso insumos por Factura',
				href: '/bocantino/ingreso-insumos/factura',
				icon: 'bx bxs-archive-in text-xl'
			},
			{
				omit_from_menu: true,
				name: 'Ingreso insumos por Remito',
				href: '/bocantino/ingreso-insumos/remito',
				icon: 'bx bxs-archive-in text-xl'
			},
			{
				omit_from_menu: true,
				name: 'Ingreso insumos por Nota de Ingreso',
				href: '/bocantino/ingreso-insumos/nota-de-ingreso',
				icon: 'bx bxs-archive-in text-xl'
			},
			{
				omit_from_menu: false,
				name: 'Listado ingresos',
				href: '/bocantino/insumos-ingresados',
				icon: 'bx bx-list-ul text-xl'
			},
			{
				omit_from_menu: false,
				name: 'Producir ingrediente',
				href: '/bocantino/producir-ingrediente',
				icon: 'bx text-xl bxs-bone'
			},

			{
				omit_from_menu: false,
				name: 'Producir producto',
				href: '/bocantino/producir-producto',
				icon: 'bx text-xl bxs-dog'
			},
			{
				omit_from_menu: false,
				name: 'Producciones pendientes',
				href: '/bocantino/solicitudes-pendientes',
				icon: 'bx bx-timer'
			},
			{
				omit_from_menu: false,
				name: 'Control de stock / Lotes',
				href: '/bocantino/lotes',
				icon: 'bx bx-list-check'
			}
		] satisfies Route[]
	},

	{
		name: 'Configuracion',
		icon: 'bx-cog',
		routes: [
			{
				omit_from_menu: false,
				name: 'Materias Primas',
				href: '/bocantino/materias-primas',
				icon: 'bx-vial'
			},
			{
				omit_from_menu: false,
				name: 'Proveedores',
				href: '/bocantino/proveedores',
				icon: 'bx-group '
			},
			{
				omit_from_menu: false,
				name: 'Productos',
				href: '/bocantino/productos',
				icon: 'bx-package '
			}
		] satisfies Route[]
	}
];
