<script lang="ts">
	import Loader from '../../_components/Loader.svelte';
	import Modal from '../../_components/Modal.svelte';
	import { trpc } from '$lib/trpc-client';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import DocumentsDetail from './documents-detail.svelte';

	export let data;
	let showModal: boolean = false;

	const selected_entry = data.entry;

	let batches: Awaited<ReturnType<typeof trpc.entries.getBatches.query>> | undefined = undefined;
	$: {
		if (selected_entry) {
			trpc.entries.getBatches.query(selected_entry.id).then((x) => (batches = x));
		}
	}
</script>

<main class="container mx-auto mt-12">
	<div class="relative rounded-md bg-surface-100-800-token p-4 pb-10">
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
			<DocumentsDetail entry_id={selected_entry.id} doc={selected_entry.document} />
		</div>

		<h2 class="h3 mt-5 mb-1">Lotes ingresados</h2>
		{#if batches}
			{#each batches as batch}
				<div class="invisible_pc mb-5 p-1 bg-slate-600 rounded shadow-md text-center">
					<p class="font-bold">Ingrediente: <span class="font-normal"> {batch.ingredient}</span></p>
					<p class="font-bold">
						Cantidad: <span class="font-normal"> {batch.initial_amount}</span>
					</p>
					<p class="font-bold">Codigo Lote: <span class="font-normal"> {batch.code}</span></p>
					<p class="font-bold">
						Fecha Produccion: <span class="font-normal"
							>{new Date(batch.production_date ?? '').toLocaleDateString('es')}</span
						>
					</p>
					<p class="font-bold">
						Fecha Vencimiento: <span class="font-normal"
							>{new Date(batch.expiration_date ?? '').toLocaleDateString('es')}</span
						>
					</p>
					<p class="font-bold">Importe: <span class="font-normal">{batch.cost} $</span></p>
					<p class="font-bold">Bolsas: <span class="font-normal">{batch.bags}</span></p>
				</div>
			{/each}
			<table class="w-full border-collapse table mb-5 invisible_movil">
				<thead class="lg:text-xl text-sm">
					<tr>
						<th>Ingrediente</th>
						<th>Cantidad</th>
						<th>Codigo Lote</th>
						<th>Fecha Produccion</th>
						<th>Fecha Vencimiento</th>
						<th>Importe</th>
						<th>Bolsas</th>
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
							<td>
								{#if batch.cost}
									{batch.cost} $
								{:else}
									--
								{/if}
							</td>
							<td>{batch.bags}</td>
						</tr>
					{/each}
				</tbody>
			</table>

			{#if selected_entry.document.type !== 'Remito'}
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
						class=" h-fit variant-filled-error lg:px-4 lg:py-2 px-2 py-1 rounded-md"
						on:click={() => (showModal = true)}>Eliminar ingreso insumos</button
					>
				</div>
			{/if}
			<Modal bind:showModal>
				<h2 slot="header" class="text-bold text-center text-xl">Accion no reversible</h2>
				<form
					action="?/remove"
					method="post"
					use:enhance={() =>
						({ result }) => {
							if (result.type == 'redirect') {
								goto(result.location);
							}
							if (result.type == 'error') window.alert(result.error.message);
						}}
				>
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
