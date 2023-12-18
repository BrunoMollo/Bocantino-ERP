<script lang="ts">
	import {
		popup,
		type PaginationSettings,
		type PopupSettings,
		type TableSource,
		tableMapperValues,
		Table
	} from '@skeletonlabs/skeleton';
	import { Paginator } from '@skeletonlabs/skeleton';

	const source = [
		{ position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
		{ position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
		{ position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
		{ position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
		{ position: 5, name: 'Boron', weight: 10.811, symbol: 'B' }
	];

	const tableSimple: TableSource = {
		head: ['Name', 'Symbol', 'Weight'],
		body: tableMapperValues(source, ['name', 'symbol', 'weight']),
		meta: tableMapperValues(source, ['position', 'name', 'symbol', 'weight'])
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
	<Table source={tableSimple} class="mb-4" />
	<Paginator
		bind:settings={paginationSettings}
		showFirstLastButtons={true}
		showPreviousNextButtons={true}
	/>
</div>
