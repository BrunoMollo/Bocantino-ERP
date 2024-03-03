<script lang="ts">
	import { enhance } from '$app/forms';
	import Spinner from '$lib/ui/Spinner.svelte';

	export let form;
	let loading = false;
</script>

<main class="p-10">
	<h1>PANTALLA PARA EL DESARROLLADOR</h1>
	<p>Esta pantalla solo esta disponible para el desarollo, no en produccion</p>

	<form action="" method="post" use:enhance>
		<button type="submit" class="btn variant-filled" on:click={() => (loading = true)}
			>REINICIAR BASE DE DATOS</button
		>
	</form>

	{#if loading && !form?.done}
		<Spinner showIf={true} size={10}></Spinner>
	{/if}

	{#if form?.done}
		<span>Se reinico la base de datos</span>
	{/if}
</main>
