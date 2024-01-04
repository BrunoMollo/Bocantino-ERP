<script lang="ts">
	import { trpc } from '$lib/trpc-client';
	import type { PageData } from '../$types';

	export let selected_entry: PageData['entries'][0] | undefined;

	function restart() {
		selected_entry = undefined;
		batches = undefined;
	}

	let batches: Awaited<ReturnType<typeof trpc.entries.getBatches.query>> | undefined = undefined;
	$: {
		if (selected_entry) {
			trpc.entries.getBatches.query(selected_entry.id).then((x) => (batches = x));
		}
	}
</script>

{#if selected_entry}
	<div style="background-color:red;" class="absolute inset-24 rounded-md bg-slate-800 p-4">
		<div>
			<button
				on:click={restart}
				class="bg-black m-3 p-3 rounded-full h-12 w-12 align-middle shadow-md"
				><i class="bx bx-arrow-back text-2xl"></i></button
			>
		</div>
		<h1>id:{selected_entry.id}</h1>
		<h2>provedor:{selected_entry.supplier}</h2>
		<h2>fecha ingreso:{selected_entry.date}</h2>
		<h2>Numero de {selected_entry.document.type}: {selected_entry.document.number}</h2>
		<h2>Fecha de emision: {selected_entry.document.issue_date}</h2>

		{#if batches}
			<p>{JSON.stringify(batches)}</p>
		{:else}
			<p>cargando</p>
		{/if}
	</div>
{/if}

<style>
</style>
