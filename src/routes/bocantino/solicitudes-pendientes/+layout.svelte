<script lang="ts">
	import Tabs from '../_components/Tabs.svelte';
</script>

<Tabs
	routes={[
		{
			name: 'Ingredientes',
			href: '/bocantino/solicitudes-pendientes/ingredientes'
		},
		{
			name: 'Productos',
			href: '/bocantino/solicitudes-pendientes/productos'
		}
	]}
/>

<main class="container h-full mx-auto flex flex-col pt-4">
	<slot />
</main>
