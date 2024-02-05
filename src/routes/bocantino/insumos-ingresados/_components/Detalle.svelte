<script lang="ts">
	import { trpc } from '$lib/trpc-client';
	import type { PageData } from '../$types';
	import Loader from '../../_components/Loader.svelte';

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
	<div class="absolute inset-48 rounded-md bg-surface-100-800-token p-4">
		<div>
			<button
				on:click={restart}
				class="bg-black m-3 p-3 rounded-full h-12 w-12 align-middle shadow-md"
				><i class="bx bx-arrow-back text-2xl"></i></button
			>
		</div>
		<div class="flex w-full justify-between text-xl pt-4">
			<h1>Id: {selected_entry.id}</h1>
			<h2>Proveedor: {selected_entry.supplier}</h2>
			<h2>
				Fecha ingreso: {selected_entry.date.getDay()} / {selected_entry.date.getMonth() + 1} / {selected_entry.date.getFullYear()}
			</h2>
		</div>
		<div class="flex justify-between">
			<h2 class="text-xl py-2">
				Numero de {selected_entry.document.type}: {selected_entry.document.number}
			</h2>
			<h2 class="text-xl py-2">
				Fecha de emision: {selected_entry.document.issue_date.getDay()} / {selected_entry.document.issue_date.getMonth() +
					1} / {selected_entry.document.issue_date.getFullYear()}
			</h2>
		</div>
		{#if batches}
			<table class="w-full mt-5 border-collapse table">
				<thead class="text-xl my-2">
					<tr class="mt-1 mb-2">
						<th>Ingrediente</th>
						<th>Cantidad</th>
						<th>Codigo</th>
						<th>Fecha Produccion</th>
						<th>Fecha Vencimiento</th>
						<th>Costo</th>
						<th>Cantidad de bolsas</th>
					</tr>
				</thead>
				<tbody>
					{#each batches as batch}
						<tr>
							<td>{batch.ingredient}</td>
							<td>{batch.initial_amount}</td>
							<td>{batch.code}</td>
							<td>{batch.production_date}</td>
							<td>{batch.expiration_date}</td>
							<td>{batch.cost}</td>
							<td>{batch.bags}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{:else}
			<div class="w-full mt-20 flex justify-center align-middle">
				<Loader --scale="2" />
			</div>
		{/if}
	</div>
{/if}

<style>
</style>
