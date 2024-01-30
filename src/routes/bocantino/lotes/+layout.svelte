<script lang="ts">
	import { TabAnchor, TabGroup } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
</script>

<TabGroup active="variant-filled-primary" border="border-solid border-b border-primary-500">
	<TabAnchor href="/bocantino/lotes/ingresados" selected={$page.url.pathname === '/lotes'}>
		<span>Ingredientes</span>
	</TabAnchor>
	<TabAnchor href="/bocantino/lotes/producidos" selected={$page.url.pathname === '/lotes'}>
		<span>Productos</span>
	</TabAnchor>
</TabGroup>

<main class="container h-full mx-auto flex flex-col pt-4">
	<slot />
</main>
