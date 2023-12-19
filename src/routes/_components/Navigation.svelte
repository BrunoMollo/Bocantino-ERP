<script lang="ts">
	import { page } from '$app/stores';
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import type { Writable } from 'svelte/store';

	const drawerStore = getDrawerStore();
	export let title: Writable<String>;

	type Route = { name: string; href: string; clases: string };
	const configurationRoutes: Route[] = [
		{
			name: 'Materias Primas',
			href: '/materias-primas',
			clases: 'bx bx-vial text-xl'
		},
		{ name: 'Proveedores', href: '/proveedores', clases: 'bx bx-group text-xl' },
		{ name: 'Productos', href: '/productos', clases: 'bx bx-package text-xl' }
	];
	const productiveRoutes: Route[] = [
		{
			name: 'Ingreso insumos',
			href: '/ingreso-insumos',
			clases: 'bx bxs-archive-in text-xl'
		},
		{
			name: 'Listado',
			href: '/insumos-ingresados',
			clases: 'bx bx-list-ul text-xl'
		}
	];
</script>

<nav class="list-nav p-4">
	<!-- fist one is styled wierdly -->
	<a class="invisible" href={$page.url.href} on:click={drawerStore.close}>volver</a>

	<ul>
		<div class="mb-5 w-full flex justify-between uppercase h-full">
			<i class="bx bx-cog text-xl"></i>
			<p class="align-middle my-auto">Configuraciones</p>
		</div>
		{#each configurationRoutes as { name, href, clases }}
			<li>
				<a
					class="btn variant-filled mb-5 w-full flex justify-between hover:text-slate-50 uppercase"
					{href}
					on:click={() => {
						drawerStore.close();
						title.set(name);
					}}
					class:active={$page.url.pathname === href}
					tabindex="0"
				>
					<i class={clases}></i>
					{name}
				</a>
			</li>
		{/each}
		<div class="pb-10"></div>
		<div class="pb-5 w-full flex justify-between uppercase h-full">
			<i class="bx bxs-grid-alt text-xl"></i>
			<p class="align-middle my-auto">Produccion</p>
		</div>

		{#each productiveRoutes as { name, href, clases }}
			<li>
				<a
					class="btn variant-filled mb-5 w-full flex justify-between hover:text-slate-50 uppercase"
					{href}
					on:click={() => {
						drawerStore.close();
						title.set(name);
					}}
					class:active={$page.url.pathname === href}
					tabindex="0"
				>
					<i class={clases}></i>
					{name}
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	a {
		border-radius: 12px;
		box-shadow:
			0 10px 15px -3px rgb(0 0 0 / 0.1),
			0 4px 6px -4px rgb(0 0 0 / 0.1);
	}
	.active {
		background-color: #055361;
		color: whitesmoke;
	}
</style>
