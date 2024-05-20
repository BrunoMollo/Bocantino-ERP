<script lang="ts">
	import type { LayoutRouteId } from '../$types';
	//@ts-ignore
	export const routes = [
		{
			name: 'Ingreso por Factura',
			bxs: 'bx bxs-file-blank text-3xl',
			href: '/bocantino/ingreso-insumos/factura'
		},
		{
			name: 'Ingreso por Nota de Ingreso',
			bxs: 'bx bxs-note text-3xl',
			href: '/bocantino/ingreso-insumos/nota-de-ingreso'
		},
		{
			name: 'Ingreso por Remito [Pendiente]',
			bxs: 'bx bxs-notepad text-3xl',
			href: '/bocantino/ingreso-insumos/remito'
		}
	] satisfies { name: string; href: LayoutRouteId }[];
</script>

<main class="container h-full mx-auto flex justify-center items-center text-center">
	<div class="h-1/3 my-auto bg-slate-700 p-10 rounded-lg drop-shadow">
		<h2 class="h2">Ingreso de insumos</h2>
		<p>Seleccione el tipo de ingreso correpondiente</p>
		<ul class="flex gap-5">
			{#each routes as { name, bxs, href }}
				<li class="pt-6">
					<div class="btn grid gap-2 rounded variant-filled">
						<i class={bxs}></i>
						<a class="" {href}>{name}</a>
					</div>
				</li>
			{/each}
		</ul>
	</div>
</main>
