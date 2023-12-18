<script lang="ts">
	import { page } from '$app/stores';
	import { getDrawerStore } from '@skeletonlabs/skeleton';

	const drawerStore = getDrawerStore();

	type Route = { name: string; href: string; clases: string; activo: boolean };
	const routes: Route[] = [
		{
			name: 'Ingreso insumos',
			href: '/ingreso-insumos',
			clases: 'bx bxs-archive-in text-xl',
			activo: false
		},
		{
			name: 'Materias Primas',
			href: '/materias-primas',
			clases: 'bx bx-vial text-xl',
			activo: false
		},
		{
			name: 'Listado',
			href: '/insumos-ingresados',
			clases: 'bx bx-list-ul text-xl',
			activo: false
		},
		{ name: 'Proveedores', href: '/proveedores', clases: 'bx bx-group text-xl', activo: true },
		{ name: 'Productos', href: '/productos', clases: 'bx bx-package text-xl', activo: false }
	];
</script>

<nav class="list-nav p-4">
	<!-- fist one is styled wierdly -->
	<a class="invisible" href={$page.url.href} on:click={drawerStore.close}>volver</a>

	<ul>
		{#each routes as { name, href, clases, activo }}
			<li>
				<a
					class="btn variant-filled mb-5 w-full flex justify-between hover:text-slate-50 uppercase"
					{href}
					on:click={drawerStore.close}
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
