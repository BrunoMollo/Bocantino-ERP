<script lang="ts">
	export let data;
</script>

<h1 class="text-center w-full">
	Holaaa, aca tenes un hermoso json. fijate como convertirlo en una pantalla
</h1>

{#each data.pending_productions as item}
	<p>{JSON.stringify(item)}</p>
	<br />
{/each}

