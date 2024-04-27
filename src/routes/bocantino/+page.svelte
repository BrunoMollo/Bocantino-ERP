<script lang="ts">
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import { generarPDF } from './solicitudes-pendientes/_shared/generar_orden_produccion.js';
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

<main class="md:container h-full mx-auto md:flex lg:gap-10 gap-3">
	<div class="flex gap-5 justify-between lg:w-8/12 md:w-6/12 py-5 lg:flex-row flex-col">
		<div class="container glass rounded p-1 lg:w-1/2 md:1/3 relative lg:m-0 max-h-80">
			<h1 class="md:text-2xl mb-2 text-center">Producciones pendientes:</h1>
			<div>
				{#if data.pending_productions.length == 0}
					<h1 class="text-center inset-36 absolute">No hay solicitudes pendientes</h1>
				{/if}
				{#each data.pending_productions as pendiente}
					<div class="flex justify-between py-1 px-3 h-14">
						<span class="text-center my-auto">{pendiente.id}</span>
						<span class="text-center my-auto">{pendiente.product.desc}</span>
						<span class="text-center my-auto">{pendiente.initial_amount} kg</span>
						<button
							class="px-5 py-2 my-auto btn variant-filled-primary rounded"
							on:click={generarPDF(pendiente.product.desc, pendiente)}
							><i class="bx bx-printer text-xl text-black h-5 w-5"></i></button
						>
					</div>
				{/each}
				{#if 5 - data.pending_productions.length > 0 && data.pending_productions.length != 0}
					{#each Array(5 - data.pending_productions.length) as _}
						<div class="flex justify-between py-1 px-3 h-14">...</div>
					{/each}
				{/if}
			</div>
		</div>
		<div class="container rounded lg:w-1/2 md:1/3 p-3 glass max-h-80">
			<h1 class="text-2xl mb-2 text-center">Ultimos ingresos:</h1>

			<div class="">
				{#each data.entries as entrada}
					<div class="flex justify-between py-1 px-3 h-14">
						<span class="text-center my-auto">{entrada.id}</span>
						<span class="text-center my-auto truncate w-1/3">{entrada.supplier}</span>
						<span class="text-center my-auto">
							{entrada.creation_date.toLocaleDateString('es')}
						</span>
						<button
							type="button"
							class="btn variant-filled-primary py-1 my-1 rounded"
							on:click={mostrarIngreso(entrada.id)}>Ver mas</button
						>
					</div>
				{/each}
				{#if 5 - data.entries.length > 0}
					{#each Array(5 - data.entries.length) as _}
						<div class="flex justify-between py-1 px-3 h-14">...</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>
	<div
		class="gap-4 lg:p-5 p-2 mt-5 rounded glass flex flex-col overflow-y-auto w-full lg:w-auto"
		style="height: calc(100vh - 100px)"
	>
		<input
			class="input w-full h-14 p-4 rounded"
			placeholder="Buscar..."
			bind:value={buscados}
			on:input={filtrar}
		/>
		{#if ingredientes.length === 0}
			<div class="card p-2 w-96 shadow-lg rounded-lg">
				<h1>No se encontraron materias primas...</h1>
			</div>
		{/if}
		{#each ingredientes as { id, name, stock, reorder_point }}
			<div
				class="shrink-0 card lg:w-96 w-full p-2 rounded-lg shadow-lg relative"
				style:background-color={stock < reorder_point ? 'rgba(127, 29, 29, 0.4)' : ''}
				style:box-shadow={stock < reorder_point ? '0 1px 25px 1px rgba(255, 0, 0, 0.8)' : ''}
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
</main>
