<script lang="ts">
	import { TabAnchor, TabGroup } from '@skeletonlabs/skeleton';
</script>

<TabGroup>
	<TabAnchor href="/productos">
		<span>Lista</span>
	</TabAnchor>
	<TabAnchor href="/productos/add">
		<span>Agregar</span>
	</TabAnchor>
</TabGroup>

<main class="container h-full mx-auto flex justify-center items-center">
	<slot />
</main>
