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

	let paginationSettings = {
		page: 0,
		limit: 10,
		size: 100,
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
		<tbody> </tbody>
	</table>
	<Paginator
		bind:settings={paginationSettings}
		showFirstLastButtons={true}
		showPreviousNextButtons={true}
	/>
</div>
