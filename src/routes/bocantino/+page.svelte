<script lang="ts">
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import { printProductionOrder } from './solicitudes-pendientes/_shared/pdf-production-order.js';
	import { items } from '$lib/dashboard-items';

	export let data;
	let buscados = '';

	$: ingredientes = data.ingredients;

	function mostrarIngreso(id: number) {
		window.location.href = 'bocantino/insumos-ingresados/' + id;
		return null;
	}

	function filtrar() {
		ingredientes = data.ingredients.filter((ingrediente) => {
			return ingrediente.name.toLocaleLowerCase().includes(buscados.toLocaleLowerCase());
		});
	}
</script>

<div class="gap-4 lg:p-5 rounded glass lg:flex w-full lg:w-auto mt-2">
	<input
		class="input w-fit lg:h-14 h-8 p-2 m-2 rounded z-10"
		placeholder="Buscar..."
		bind:value={buscados}
		on:input={filtrar}
	/>
	<div class="flex overflow-y-auto gap-4">
		{#if ingredientes.length === 0}
			<div class="card p-2 w-96 shadow-lg rounded-lg">
				<h1>No se encontraron materias primas...</h1>
			</div>
		{/if}
		{#each ingredientes as { id, name, stock, reorder_point }}
			<div
				class="shrink-0 card lg:w-96 w-full p-2 rounded-lg shadow-lg relative"
				class:variant-glass-error={stock < reorder_point}
				class:variant-glass-primary={stock >= reorder_point}
			>
				{#if stock < reorder_point}
					<div class="absolute right-5 bottom-4">
						<ProgressRadial
							width="w-24"
							font={128}
							stroke={70}
							value={(stock / reorder_point) * 100}
						>
							{Math.round((stock / reorder_point) * 100)}%
						</ProgressRadial>
					</div>
				{:else}
					<div class="absolute right-5 bottom-4">
						<ProgressRadial width="w-24" font={128} stroke={70} value={100}>OK</ProgressRadial>
					</div>
				{/if}
				<h1>ID:{id}</h1>
				<h2 class="uppercase text-xl w-9/12">{name}</h2>
				<p class="mt-3">Punto de pedido: {reorder_point}</p>
				<p>Stock real: {Math.round(stock * 10) / 10}</p>
			</div>
		{/each}
	</div>
</div>

<main class="md:container h-full mx-auto md:flex lg:gap-10 gap-3">
	<div class="flex gap-5 justify-between lg:w-8/12 md:w-6/12 py-5 lg:flex-row flex-col">
		{#if $items[0].show}
			<div
				class="container rounded lg:w-1/2 md:1/3 p-5 glass max-h-96 flex flex-col justify-between"
			>
				<h1 class="text-2xl mb-2 text-center">Producciones pendientes:</h1>
				{#if data.pending_productions.length == 0}
					<h1 class="text-center inset-36 absolute">No hay solicitudes pendientes</h1>
				{/if}
				<div class="table-container rounded">
					<table class="table table-hover table-compact">
						<tbody>
							{#each data.pending_productions as pendiente}
								<tr>
									<td>{pendiente.id}</td>
									<td>{pendiente.product.desc}</td>
									<td>{pendiente.initial_amount}</td>
									<td
										><button
											class="btn variant-ringed-primary"
											on:click={printProductionOrder(pendiente.product.desc, pendiente)}
											><i class="bx bx-printer text-xl h-5 w-5"></i></button
										></td
									>
								</tr>
							{/each}
							{#if 5 - data.pending_productions.length > 0 && data.pending_productions.length != 0}
								{#each Array(5 - data.pending_productions.length) as _}
									<tr
										><td class="flex justify-between py-1 px-3">...</td>
										<td> </td> <td> </td> <td></td></tr
									>
								{/each}
							{/if}
						</tbody>
					</table>
				</div>
				{#if 5 - data.entries.length > 0}
					{#each Array(5 - data.entries.length) as _}
						<div class="flex justify-between py-1 px-3">...</div>
					{/each}
				{/if}
			</div>
		{/if}
		{#if $items[1].show}
			<div
				class="container rounded lg:w-1/2 md:1/3 p-5 glass max-h-96 flex flex-col justify-between"
			>
				<h1 class="text-2xl mb-2 text-center">Ultimos ingresos:</h1>
				{#each data.entries as entrada}
					<div class=" flex justify-between px-3 gap-2">
						<span class="text-center my-auto">{entrada.id}</span>
						<span class="text-center my-auto truncate w-1/3">{entrada.supplier}</span>
						<span class="text-center my-auto">
							{entrada.creation_date.toLocaleDateString('es')}
						</span>
						<button
							type="button"
							class="btn variant-ringed-primary py-1 my-1 rounded"
							on:click={mostrarIngreso(entrada.id)}>Ver mas</button
						>
					</div>
				{/each}
				{#if 5 - data.entries.length > 0}
					{#each Array(5 - data.entries.length) as _}
						<div class="flex justify-between py-1 px-3">...</div>
					{/each}
				{/if}
			</div>
		{/if}
	</div>
</main>
