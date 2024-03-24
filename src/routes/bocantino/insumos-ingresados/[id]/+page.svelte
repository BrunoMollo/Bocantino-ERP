<script lang="ts">
	import Loader from '../../_components/Loader.svelte';
	import { trpc } from '$lib/trpc-client';
	import { page } from '$app/stores';

	export let data;

	const selected_entry = data.entry;

	let batches: Awaited<ReturnType<typeof trpc.entries.getBatches.query>> | undefined = undefined;
	$: {
		if (selected_entry) {
			trpc.entries.getBatches.query(selected_entry.id).then((x) => (batches = x));
		}
	}
</script>

<main class=" container mx-auto mt-12">
	<div class="absolute rounded-md bg-surface-100-800-token p-4 pb-10">
		<div>
			<a href="/bocantino/insumos-ingresados" class="align-middle hover:text-secondary-400">
				<i class="bx bx-arrow-back text-2xl"></i>
			</a>
		</div>
		<h1 class="h3">Detalle ingreso de Materia Prima</h1>
		<div class="pt-4 pl-4 grid grid-cols-2 text-lg">
			<div class="grid">
				<span>Id: {selected_entry.id}</span>
				<span>Proveedor: {selected_entry.supplier}</span>
				<span>Fecha ingreso: {selected_entry.date.toLocaleDateString('es')}</span>
			</div>
			<div class="grid">
				<span>
					Numero de {selected_entry.document.type}: {selected_entry.document.number}
				</span>
				<span>
					Fecha de emision:{selected_entry.document.issue_date.toLocaleDateString('es')}
				</span>
				<span class="invisible">this is a css hack</span>
			</div>
		</div>
		<h2 class="h3 mt-5">Lotes ingresados</h2>
		{#if batches}
			<table class="w-full border-collapse table">
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
			{@const total = subtotal * (1 + iva) + withdrawal}

			<div>
				<p>Iva:{iva}</p>
				<p>Percepciones: {withdrawal}</p>
				<p>Total: {Math.round(total * 100) / 100}</p>
			</div>
		{:else}
			<div class="w-full mt-20 flex justify-center align-middle">
				<Loader --scale="2" />
			</div>
		{/if}
		<div class="flex justify-end pr-10">
			<a class="btn variant-ghost" href={$page.url.pathname + '/edit'}>editar</a>
		</div>
	</div>
</main>
