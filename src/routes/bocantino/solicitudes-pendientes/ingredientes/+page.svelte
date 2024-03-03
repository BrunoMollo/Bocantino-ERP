<script lang="ts">
	import { fade } from 'svelte/transition';
	import { generarPDF } from '../_shared/generar_orden_produccion.js';
	import CompleteTable from '../../_components/complete-table.svelte';

	export let data;
</script>

<h1 class="text-center w-full uppercase text-2xl my-5">
	Ordenes de producción en proceso: Ingredientes
</h1>

<table class="table w-11/12 mx-auto p-2 rounded-md shadow-lg">
	<thead>
		<tr>
			<th class="w-1/4">ID Produccion</th>
			<th class="w-1/4">Ingrediente a producir</th>
			<th class="w-1/4">Cantidad a producir</th>
			<th class="w-1/4"></th>
		</tr>
	</thead>
	<tbody>
		{#each data.pending_productions as item}
			<tr out:fade>
				<td style="padding-left: 16px;">{item.id}</td>
				<td style="padding-left: 16px;">{item.ingredient.name}</td>
				<td style="padding-left: 16px;">{item.initial_amount} {item.ingredient.unit}</td>
				<td style="padding-left: 16px;" class="gap-5 flex">
					<a href="#">ver</a>
					<button
						class="rounded-full bg-white px-3 py-2"
						on:click={generarPDF(item.ingredient.name, item)}
						><i class="bx bx-printer text-xl text-black h-5 w-5"></i></button
					>
				</td>
			</tr>
		{/each}
		<CompleteTable list={data.pending_productions} rows={4} />
	</tbody>
</table>
