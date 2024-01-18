<script lang="ts">
	import { trpc } from '$lib/trpc-client';
	import Detalle from './_components/Detalle.svelte';
	import { popup, type PaginationSettings, type PopupSettings } from '@skeletonlabs/skeleton';
	import { Paginator } from '@skeletonlabs/skeleton';
	export let data;
	let paginationSettings = {
		page: 0,
		limit: 10,
		size: 100,
		amounts: [1, 2, 5, 10]
	} satisfies PaginationSettings;

	const popupClick: PopupSettings = {
		event: 'click',
		target: 'popupClick',
		placement: 'bottom'
	};

	const filtros = {
		supplier: '',
		dateInitial: null,
		dateFinal: null,
		number: ''
	};
	let listafiltrada = data.entries;

	let selected_entry: (typeof data.entries)[0] | undefined = undefined;

	function expandirDetalle(idEntrada: string) {
		if (idEntrada) {
			selected_entry = data.entries.find((x) => x.id == Number(idEntrada));
			return null;
		}
	}

	async function filtrar() {
		listafiltrada = await trpc.entries.get
			.query({
				dateFinal: filtros.dateFinal,
				dateInitial: filtros.dateInitial,
				supplierName: filtros.supplier,
				documentNumber: filtros.number,
				page: paginationSettings.page,
				pageSize: paginationSettings.limit
			})
			.then((x) => (x ? x : []))
			.then((x) =>
				x.map((b) => ({
					...b,
					date: new Date(b.date),
					document: { ...b.document, issue_date: new Date(b.document.issue_date) }
				}))
			);
	}
</script>

<div
	class="rounded-full bg-slate-950 w-64 flex justify-between py-2 px-5 mt-10 mx-auto"
	use:popup={popupClick}
>
	<p>Filtrar...</p>
	<i class="bx bx-search-alt text-white text-xl"></i>
</div>

<div class="card p-4 variant-filled-secondary w-80 rounded" data-popup="popupClick">
	<h1 class="text-center w-full">Filtros</h1>
	<div class="">
		<p>Proveedor:</p>
		<input
			type="text"
			class="input rounded"
			placeholder="Ingrese el proveedor..."
			bind:value={filtros.supplier}
		/>
	</div>
	<div class="">
		<p>Fechas:</p>
		<div class="flex gap-1">
			<input
				type="date"
				class="input rounded"
				placeholder="Inicio"
				bind:value={filtros.dateInitial}
			/>
			<input type="date" class="input rounded" placeholder="Fin" bind:value={filtros.dateFinal} />
		</div>
	</div>
	<div class="">
		<p>Comprobante:</p>
		<input
			type="text"
			class="input rounded"
			placeholder="Ingrese el codigo..."
			bind:value={filtros.number}
		/>
	</div>
	<button type="button" class="btn rounded variant-filled mt-5 float-right" on:click={filtrar}
		>Filtrar</button
	>
	<div class="arrow variant-filled-secondary" />
</div>
<div class="w-11/12 mx-auto mt-10">
	<table class="table mb-4 rounded">
		<thead>
			<tr>
				<th class="text-center w-2/12">ID:</th>
				<th class="text-center w2/12">Proveedor:</th>
				<th class="text-center w-2/12">Fecha alta:</th>
				<th class="text-center w-2/12">Comprobante:</th>
				<th class="text-center w-2/12"></th>
			</tr>
		</thead>
		<tbody class="">
			{#each listafiltrada as entrada}
				<tr class="align-middle my-auto">
					<td style="vertical-align:middle" class="text-center w-2/12">{entrada.id}</td>
					<td style="vertical-align:middle" class="text-center w-2/12">{entrada.supplier}</td>
					<td style="vertical-align:middle" class="text-center w-2/12">
						{entrada.date.toLocaleDateString('es')}
					</td>
					<td style="vertical-align:middle" class="text-center w-2/12 my-auto"
						>{entrada.document.number} ({entrada.document.type})</td
					>
					<td style="vertical-align:middle" class="text-center w-2/12">
						<button
							type="button"
							class="btn variant-filled-primary rounded"
							on:click={expandirDetalle(entrada.id.toString())}>Detalles</button
						></td
					>
				</tr>
			{/each}
		</tbody>
	</table>
	<Paginator
		bind:settings={paginationSettings}
		showFirstLastButtons={true}
		on:page={filtrar}
		on:amount={filtrar}
		showPreviousNextButtons={true}
	/>
</div>

<Detalle {selected_entry} />

