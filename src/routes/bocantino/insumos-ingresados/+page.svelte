<script lang="ts">
	import { popup, type PaginationSettings, type PopupSettings } from '@skeletonlabs/skeleton';
	import { Paginator } from '@skeletonlabs/skeleton';
	import CompleteTable from '../_components/complete-table.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	export let data;
	const paginationSettings = {
		page: Number($page.url.searchParams.get('page')) || 0,
		limit: data.page_size,
		size: data.count_entries,
		amounts: []
	} satisfies PaginationSettings;

	const popupClick: PopupSettings = {
		event: 'click',
		target: 'popupClick',
		placement: 'bottom'
	};

	const filtros = {
		supplier: $page.url.searchParams.get('supplier'),
		dateInitial: $page.url.searchParams.get('initial_date'),
		dateFinal: $page.url.searchParams.get('final_date'),
		number: $page.url.searchParams.get('number'),
		page: $page.url.searchParams.get('page'),
		doc_type: $page.url.searchParams.get('doc_type')
	};
	const query = new URLSearchParams($page.url.searchParams.toString());

	async function filtrar(page?: { detail: number }) {
		if (page) {
			filtros.page = page.detail.toString();
		}
		for (let key in filtros) {
			//@ts-expect-error PENDING: explain
			const value = filtros[key];
			if (value) {
				query.set(key, value);
			} else {
				query.delete(key);
			}
		}
		goto(`?${query.toString()}`);
	}
	function clear_filters() {
		filtros.supplier = '';
		filtros.dateInitial = '';
		filtros.dateFinal = '';
		filtros.number = '';
		filtros.page = '';
		filtros.doc_type = '';
		filtrar();
	}
</script>

<div
	class="rounded-full card w-64 flex justify-between py-2 px-5 md:mt-3 mx-auto"
	use:popup={popupClick}
>
	<p>Filtrar...</p>
	<i class="bx bx-search-alt text-xl"></i>
</div>

<div class="card p-4 w-96 rounded shadow-xl" data-popup="popupClick">
	<h1 class="text-center w-full">Filtros</h1>
	<div class="pb-1">
		<p>Proveedor:</p>
		<input
			type="text"
			class="input rounded"
			placeholder="Ingrese el proveedor..."
			bind:value={filtros.supplier}
		/>
	</div>
	<div class="pb-1">
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

	<div class="">
		<p>Tipo de documento:</p>
		<select class="select rounded" bind:value={filtros.doc_type}>
			<option value="Remito">Remito</option>
			<option value="Factura">Factura</option>
			<option value="Nota de Ingreso">Nota de Ingreso</option>
			<option value="Remito & Factura">Remito & Factura</option>
		</select>
	</div>
	<button
		type="button"
		class="btn rounded variant-filled-warning mt-5 float-left"
		on:click={() => clear_filters()}>Limpiar filtros</button
	>
	<button
		type="button"
		class="btn rounded variant-filled-primary mt-5 float-right"
		on:click={() => filtrar()}>Filtrar</button
	>
	<div class="arrow bg-surface-100-800-token" />
</div>
<div class="md:w-11/12 md:mx-auto my-3">
	<table class="table table-compact mb-4 rounded">
		<thead>
			<tr>
				<th class="text-center">ID:</th>
				<th class="text-center">Proveedor:</th>
				<th class="text-center">Fecha alta:</th>
				<th class="text-center invisible_movil">Comprobante:</th>
				<th class="text-center"></th>
			</tr>
		</thead>
		<tbody class="">
			{#each data.entries as entrada}
				<tr class="align-middle my-auto">
					<td class="text-center">{entrada.id}</td>
					<td class="text-center truncate" style="max-width: 80px;">{entrada.supplier}</td>
					<td class="text-center">
						{entrada.date.toLocaleDateString('es')}
					</td>
					<td class="text-center invisible_movil"
						>{entrada.document.number} ({entrada.document.type})</td
					>
					<td class="text-center">
						<a
							class="btn variant-filled-primary rounded"
							href={'/bocantino/insumos-ingresados/' + entrada.id}>ver detalle</a
						>
					</td></tr
				>
			{/each}
			<CompleteTable list={data.entries} rows={5} />
		</tbody>
	</table>
	<Paginator
		settings={paginationSettings}
		showFirstLastButtons={true}
		controlSeparator="variant-filled-primary"
		on:page={filtrar}
		showPreviousNextButtons={true}
	/>
</div>
