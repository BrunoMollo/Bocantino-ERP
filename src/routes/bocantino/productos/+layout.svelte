<script lang="ts">
	import Tabs from '../_components/Tabs.svelte';
	const routes = [
		{ name: 'Lista', href: '/bocantino/productos' },
		{ name: 'Agregar', href: '/bocantino/productos/add' }
	];
</script>

<Tabs {routes} />

<main class="container h-full mx-auto flex justify-center items-center">
	<slot />
</main>
