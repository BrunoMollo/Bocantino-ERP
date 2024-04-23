<script lang="ts">
	import type { LayoutRouteId } from '../$types';

	export const routes = [
		{
			name: 'Ingreso por Factura',
			href: '/bocantino/ingreso-insumos/factura'
		},
		{
			name: 'Ingreso por Remito',
			href: '/bocantino/ingreso-insumos/factura' // TODO: Change
		},
		{
			name: 'Ingreso por Nota de Ingreso',
			href: '/bocantino/ingreso-insumos/factura' //TODO: Change
		}
	] satisfies { name: string; href: LayoutRouteId }[];
</script>

<main class="container h-full mx-auto flex justify-center items-center">
	<ul>
		{#each routes as { name, href }}
			<li class="pt-6">
				<a {href}>{name}</a>
			</li>
		{/each}
	</ul>
</main>
