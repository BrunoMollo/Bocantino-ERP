<script lang="ts">
	import { page } from '$app/stores';
	import { getDrawerStore } from '@skeletonlabs/skeleton';

	const drawerStore = getDrawerStore();

	type Route = { name: string; href: string };
	const routes: Route[] = [
		{ name: 'Materias Primas', href: '/materias-primas' },
		{ name: 'Proveedores', href: '/proveedores' },
		{ name: 'Productos', href: '/productos' },
		{ name: 'Lotes', href: '/lotes' }
	];
</script>

<nav class="list-nav p-4">
	<!-- fist one is styled wierdly -->
	<a class="invisible" href={$page.url.href} on:click={drawerStore.close}>volver</a>

	<ul>
		{#each routes as { name, href }}
			<li>
				<a class="btn variant-filled mb-5 w-full" {href} on:click={drawerStore.close} tabindex="0"
					>{name}</a
				>
			</li>
		{/each}
	</ul>
</nav>
