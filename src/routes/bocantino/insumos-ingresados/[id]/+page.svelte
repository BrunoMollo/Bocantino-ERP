<script lang="ts">
	import Loader from '../../_components/Loader.svelte';
	import Modal from '../../_components/Modal.svelte';
	import { trpc } from '$lib/trpc-client';

	export let data;

	let showModal: boolean = false;

	const selected_entry = data.entry;

	function eliminar() {}

	let batches: Awaited<ReturnType<typeof trpc.entries.getBatches.query>> | undefined = undefined;
	$: {
		if (selected_entry) {
			trpc.entries.getBatches.query(selected_entry.id).then((x) => (batches = x));
		}
	}
</script>

<main class="container mx-auto mt-12">
	<div class="rounded-md bg-surface-100-800-token p-4 pb-10">
		<div>
			<a href="/bocantino/insumos-ingresados" class="align-middle hover:text-secondary-400">
				<i class="bx bx-arrow-back text-2xl"></i>
			</a>
		</div>
		<h1 class="h3">Detalle ingreso de materia prima</h1>
		<div class="pt-4 pl-4 grid grid-cols-1 text-lg">
			<p><span class="font-bold">Id: </span>{selected_entry.id}</p>
			<p><span class="font-bold">Proveedor: </span> {selected_entry.supplier}</p>
			<p>
				<span class="font-bold">Fecha ingreso: </span>
				{selected_entry.date.toLocaleDateString('es')}
			</p>
			<p>
				<span class="font-bold">Numero de {selected_entry.document.type}: </span>
				{selected_entry.document.number}
			</p>
			<p class="mb-5">
				<span class="font-bold">Fecha de emision: </span>{selected_entry.date.toLocaleDateString(
					'es'
				)}
			</p>
		</div>
		<h2 class="h3 mt-5 mb-1">Lotes ingresados</h2>
		{#if batches}
			<table class="w-full border-collapse table mb-5">
				<thead class="text-xl">
					<tr>
						<th>Ingrediente</th>
						<th>Cantidad</th>
						<th>Codigo Lote</th>
						<th>Fecha Produccion</th>
						<th>Fecha Vencimiento</th>
						<th>Importe</th>
						<th># bolsas</th>
					</tr>
				</thead>
				<tbody class="text-center">
					{#each batches as batch}
						<tr>
							<td>{batch.ingredient}</td>
							<td>{batch.initial_amount}</td>
							<td>{batch.code}</td>
							<td>{new Date(batch.production_date ?? '').toLocaleDateString('es')}</td>
							<td>{new Date(batch.expiration_date ?? '').toLocaleDateString('es')}</td>
							<td>{batch.cost}</td>
							<td>{batch.bags}</td>
						</tr>
					{/each}
				</tbody>
			</table>

			{@const iva = batches[0].iva_tax_percentage}
			{@const withdrawal = batches[0].withdrawal_tax_amount}
			{@const subtotal = batches.map((x) => x.cost ?? 0).reduce((a, b) => a + b, 0)}
			{@const total = subtotal * (1 + iva / 100) + withdrawal}

			<div class="flex justify-between">
				<div>
					<p><span class="font-bold">Iva: </span>{iva} %</p>
					<p><span class="font-bold">Percepciones: </span>{withdrawal} $</p>
					<p><span class="font-bold">Total:</span> {Math.round(total * 100) / 100} $</p>
				</div>
				<button
					class=" h-fit variant-filled-error px-4 py-2 rounded-md"
					on:click={() => (showModal = true)}>Eliminar ingreso insumos</button
				>
			</div>
			<Modal bind:showModal>
				<h2 slot="header" class="text-bold text-center text-xl">Accion no reversible</h2>
				<form action="?/remove" method="post">
					<button class=" h-fit variant-filled-error px-4 py-2 rounded-md" type="submit"
						>Eliminar</button
					>
				</form>
			</Modal>
		{:else}
			<div class="w-full mt-20 flex justify-center align-middle">
				<Loader --scale="2" />
			</div>
		{/if}
	</div>
</main>
