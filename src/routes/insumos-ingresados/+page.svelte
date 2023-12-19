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

	const source = [
		{ position: 1, proveedor: 'Juan S.A', fechaAlta: '11-04-2023', codigoFactura: '32084fc08' },
		{ position: 2, proveedor: 'Fernando S.A', fechaAlta: '11-04-2023', codigoFactura: '249fj24' },
		{ position: 3, proveedor: 'Zapallo S.A', fechaAlta: '11-04-2023', codigoFactura: '428983rd' },
		{ position: 4, proveedor: 'Beryllium S.A', fechaAlta: '11-04-2023', codigoFactura: '49fjw942' },
		{ position: 5, proveedor: 'Corral S.A.', fechaAlta: '11-04-2023', codigoFactura: '5f8j39f' }
	];

	const tableSimple: TableSource = {
		head: ['ID', 'Proveedor', 'Fecha alta', 'Codigo Factura'],
		body: tableMapperValues(source, ['position', 'proveedor', 'fechaAlta', 'codigoFactura']),
		meta: tableMapperValues(source, ['position', 'Proveedor', 'FechaAlta', 'codigoFactura'])
	};

	let paginationSettings = {
		page: 0,
		limit: 10,
		size: source.length,
		amounts: [1, 2, 5, 10]
	} satisfies PaginationSettings;

	const popupClick: PopupSettings = {
		event: 'click',
		target: 'popupClick',
		placement: 'right'
	};
</script>

<div
	class="rounded-full bg-slate-950 w-56 flex justify-between py-2 px-5 mt-10 mx-auto"
	use:popup={popupClick}
>
	<p>Filtrar...</p>
	<i class="bx bx-search-alt text-white text-xl"></i>
</div>

<div class="card p-4 variant-filled-primary w-56" data-popup="popupClick">
	<h1 class="text-center w-full">Filtros</h1>
	<div class="">
		<p>Proveedor:</p>
	</div>
	<div class="arrow variant-filled-primary" />
</div>
<div class="w-11/12 mx-auto mt-10">
	<Table source={tableSimple} interactive={true} class="mb-4" />
	<Paginator
		bind:settings={paginationSettings}
		showFirstLastButtons={true}
		showPreviousNextButtons={true}
	/>
</div>
