<script lang="ts">
	import { TabAnchor, TabGroup } from '@skeletonlabs/skeleton';
</script>

<TabGroup>
	<TabAnchor href="/materias-primas/list">
		<span>Lista</span>
	</TabAnchor>
	<TabAnchor href="/materias-primas/add">
		<span>Agregar</span>
	</TabAnchor>
</TabGroup>

<main class="container h-full mx-auto flex justify-center items-center">
	<slot />
</main>
