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
	<div class="absolute inset-24 rounded-md bg-slate-800 p-4">
		<div>
			<button
				on:click={restart}
				class="bg-black m-3 p-3 rounded-full h-12 w-12 align-middle shadow-md"
				><i class="bx bx-arrow-back text-2xl"></i></button
			>
		</div>
		<div class="flex w-full justify-between text-2xl pt-4">
			<h1>ID: {selected_entry.id}</h1>
			<h2>PROVEEDOR: {selected_entry.supplier}</h2>
			<h2>
				FECHA INGRESO: {selected_entry.date.getDay()} / {selected_entry.date.getMonth() + 1} / {selected_entry.date.getFullYear()}
			</h2>
		</div>

		<h2 class="text-xl py-2">
			NUMERO DE {selected_entry.document.type.toUpperCase()}: {selected_entry.document.number}
		</h2>
		<h2>
			FECHA DE EMISION: {selected_entry.document.issue_date.getDay()} / {selected_entry.document.issue_date.getMonth() +
				1} / {selected_entry.document.issue_date.getFullYear()}
		</h2>

		{#if batches}
			<!-- <p>{JSON.stringify(batches)}</p> -->
			<table class="w-full mt-5 shadow-lg border border-collapse table">
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
							<td>{batch.initialAmount}</td>
							<td>{batch.code}</td>
							<td>{batch.productionDate}</td>
							<td>{batch.expirationDate}</td>
							<td>{batch.cost}</td>
							<td>{batch.bags}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{:else}
			<p>cargando</p>
		{/if}
	</div>
{/if}

<style>
</style>
