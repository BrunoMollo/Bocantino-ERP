<script lang="ts">
	import Tabs from '../_components/Tabs.svelte';
	const routes = [
		{ name: 'Lista', href: '/bocantino/materias-primas' },
		{ name: 'Agregar', href: '/bocantino/materias-primas/add' }
	];
</script>

<Tabs {routes} />

<main class="container h-full mx-auto flex justify-center items-center">
	<slot />
</main>

