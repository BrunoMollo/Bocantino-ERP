<script lang="ts">
	import { TabAnchor, TabGroup } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
</script>

<TabGroup active="variant-filled-primary" border="border-solid border-b border-primary-500">
	<TabAnchor
		href="/bocantino/solicitudes-pendientes/ingredientes"
		selected={$page.url.pathname === '/proveedores'}
	>
		<span>Ingredientes</span>
	</TabAnchor>
	<TabAnchor
		href="/bocantino/solicitudes-pendientes/productos"
		selected={$page.url.pathname === '/proveedores/add'}
	>
		<span>Productos</span>
	</TabAnchor>
</TabGroup>

<main class="container h-full mx-auto flex flex-col pt-4">
	<slot />
</main>

