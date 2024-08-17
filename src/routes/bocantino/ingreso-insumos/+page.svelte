<script lang="ts">
	import type { LayoutRouteId } from '../$types';

	export const routes = [
		{
			name: 'Ingreso por Factura',
			href: '/bocantino/ingreso-insumos/factura'
		},
		{
			name: 'Ingreso por Nota de Ingreso',
			href: '/bocantino/ingreso-insumos/nota-de-ingreso'
		},
		{
			name: 'Ingreso por Remito',
			href: '/bocantino/ingreso-insumos/remito'
		}
	] satisfies { name: string; href: LayoutRouteId }[];
</script>

<main class="container h-full mx-auto flex justify-center items-center">
	<div>
		<h2 class="h2">Ingreso de insumos</h2>
		<p>Seleccione el tipo de ingreso correpondiente</p>
		<ul>
			{#each routes as { name, href }}
				<li class="pt-6">
					<a class="btn variant-filled rounded w-full" {href}>{name}</a>
				</li>
			{/each}
		</ul>
	</div>
</main>
