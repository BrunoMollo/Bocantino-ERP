<script lang="ts">
	import { TabAnchor, TabGroup } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
</script>

<TabGroup active="variant-filled-primary" border="border-solid border-b border-primary-500">
	<TabAnchor href="/productos" selected={$page.url.pathname === '/productos'}>
		<span>Lista</span>
	</TabAnchor>
	<TabAnchor href="/productos/add" selected={$page.url.pathname === '/productos/add'}>
		<span>Agregar</span>
	</TabAnchor>
</TabGroup>

<main class="container h-full mx-auto flex justify-center items-center">
	<slot />
</main>
