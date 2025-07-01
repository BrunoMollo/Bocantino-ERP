<script lang="ts">
	import { fade } from 'svelte/transition';
	import CompleteTable from '../../_components/complete-table.svelte';
	import { printProductionOrder } from '../_shared/pdf-production-order';

	export let data;
</script>

<h1 class="text-center w-full uppercase text-2xl my-5">
	Ordenes de producción en proceso: Productos
</h1>

<table class="table table-compact w-11/12 mx-auto p-2 rounded-md shadow-lg">
	<thead>
		<tr>
			<th class="w-1/4">ID Produccion</th>
			<th class="w-1/4">Producto a producir</th>
			<th class="w-1/4">Cantidad a producir</th>
			<th class="w-1/4"></th>
		</tr>
	</thead>
	<tbody>
		{#each data.pending_productions as item}
			<tr out:fade>
				<td class="p-4">{item.id}</td>
				<td class="p-4">{item.product.desc}</td>
				<td class="p-4">{item.initial_amount} Kg</td>
				<td class="gap-5 flex p-4">
					<a
						class="text-lg align-middle pt-1 w-1/2 btn variant-filled-primary rounded"
						href="/bocantino/solicitudes-pendientes/productos/{item.id}">ver</a
					>
					<button
						class="rrounded btn variant-filled-primary px-5 w-1/2 py-2 flex justify-center items-center"
						on:click={printProductionOrder(item.product.desc, item)}
						><i class="bx bx-printer text-xl text-black h-5 w-5"></i></button
					>
				</td>
			</tr>
		{/each}
		<CompleteTable list={data.pending_productions} rows={4} />
	</tbody>
</table>
