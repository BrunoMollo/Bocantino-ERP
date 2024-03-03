<script lang="ts">
	import Tabs from '../_components/Tabs.svelte';
	const routes = [
		{ name: 'Ingredientes', href: '/bocantino/lotes/ingredientes' },
		{ name: 'Productos', href: '/bocantino/lotes/productos' }
	];
</script>

<Tabs {routes} />

<main class="container h-full mx-auto flex flex-col pt-4">
	<slot />
</main>
