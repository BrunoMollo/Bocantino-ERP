<script lang="ts">
	import { TabAnchor, TabGroup } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
</script>

<TabGroup active="variant-filled-primary" border="border-solid border-b border-primary-500">
	
	<TabAnchor href="/materias-primas" selected={$page.url.pathname === '/materias-primas'}>
		
		<span>Lista</span>
	</TabAnchor>
	<TabAnchor href="/materias-primas/add" selected={$page.url.pathname === '/materias-primas/add'}>
		<span>Agregar</span>
	</TabAnchor>
</TabGroup>

<main class="container h-full mx-auto flex justify-center items-center">
	<slot />
</main>
