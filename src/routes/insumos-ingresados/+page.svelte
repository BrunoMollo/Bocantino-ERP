<script lang="ts">
	import {
		popup,
		type PaginationSettings,
		type PopupSettings,
		type TableSource,
		tableMapperValues,
		Table,
		FileButton
	} from '@skeletonlabs/skeleton';
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
		date: '',
		number: ''
	};
	let listafiltrada = data.entries;

	function filtrar() {
		if (filtros.supplier != '') {
			listafiltrada = data.entries.filter((entrada) => {
				return entrada.supplier.toString() === filtros.supplier.toString();
			});
		} else listafiltrada = data.entries;
	}
</script>

<div
	class="rounded-full bg-slate-950 w-64 flex justify-between py-2 px-5 mt-10 mx-auto"
	use:popup={popupClick}
>
	<p>Filtrar...</p>
	<i class="bx bx-search-alt text-white text-xl"></i>
</div>

<div class="card p-4 variant-filled-secondary w-64 rounded" data-popup="popupClick">
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
		<p>Fecha:</p>
		<input
			type="text"
			class="input rounded"
			placeholder="Ingrese la fecha..."
			bind:value={filtros.date}
		/>
	</div>
	<div class="">
		<p>Factura:</p>
		<input
			type="text"
			class="input rounded"
			placeholder="Ingrese el codigo..."
			bind:value={filtros.number}
		/>
	</div>
	<button
		type="button"
		class="btn rounded variant-filled-primary mt-5 float-right"
		on:click={filtrar}>Filtrar</button
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
				<th class="text-center w-2/12">Codigo factura:</th>
				<th class="text-center w-2/12"></th>
			</tr>
		</thead>
		<tbody class="">
			{#each listafiltrada as entrada}
				<tr class="align-middle my-auto">
					<td style="vertical-align:middle" class="text-center w-2/12">{entrada.id}</td>
					<td style="vertical-align:middle" class="text-center w-2/12">{entrada.supplier}</td>
					<td style="vertical-align:middle" class="text-center w-2/12"
						>{entrada.date.getDate() +
							'/' +
							entrada.date.getMonth() +
							'/' +
							entrada.date.getFullYear()}</td
					>
					<td style="vertical-align:middle" class="text-center w-2/12 my-auto">{entrada.number}</td>
					<td style="vertical-align:middle" class="text-center w-2/12"
						><button type="button" class="btn variant-filled-primary rounded">Detalles</button></td
					>
				</tr>
			{/each}
		</tbody>
	</table>
	<Paginator
		bind:settings={paginationSettings}
		showFirstLastButtons={true}
		showPreviousNextButtons={true}
	/>
</div>
