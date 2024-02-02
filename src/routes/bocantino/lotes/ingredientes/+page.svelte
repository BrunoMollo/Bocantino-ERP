<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import { Paginator, type PaginationSettings } from '@skeletonlabs/skeleton';
	import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
	export let data;

	const popupClick: PopupSettings = {
		event: 'click',
		target: 'popupClick',
		placement: 'bottom'
	};

	const filtros = {
		batch_code: '',
		ingredient_name: ''
	};

	const paginationSettings = {
		page: Number($page.url.searchParams.get('page')) || 0,
		limit: data.page_size,
		size: data.count_batches,
		amounts: []
	} satisfies PaginationSettings;

	function changePage({ detail }: { detail: number }) {
		let query = new URLSearchParams($page.url.searchParams.toString());
		query.set('page', detail.toString());
		goto(`?${query.toString()}`);
	}

	let listaFiltrada = data.batches;
	const condicionFiltrado = (item: any): boolean =>
		String(item.batch_code).includes(filtros.codigo) &&
		String(item.ingredient.name).includes(filtros.ingrediente);

	async function filtrar() {
		if (filtros.codigo != '' || filtros.ingrediente != '') {
			listaFiltrada = data.batches.filter(condicionFiltrado);
		} else listaFiltrada = data.batches;
	}
</script>

<main class="container flex flex-col mx-auto pt-10">
	<div class="w-11/12 mx-auto">
		<div
			class="rounded-full bg-slate-950 w-1/4 flex justify-between py-4 px-6 mb-8"
			use:popup={popupClick}
		>
			<p class="mr-10">Filtrar...</p>
			<i class="bx bx-search-alt text-white text-2xl"></i>
		</div>
	</div>

	<div class="card p-4 variant-filled-secondary w-80 rounded" data-popup="popupClick">
		<h1 class="text-center w-full">Filtros</h1>
		<div class="">
			<p>Ingrediente:</p>
			<input
				type="text"
				class="input rounded"
				placeholder="Ingrese el ingrediente..."
				bind:value={filtros.ingredient_name}
			/>
		</div>
		<div class="">
			<p>Codigo:</p>
			<input
				type="text"
				class="input rounded"
				placeholder="Ingrese el codigo..."
				bind:value={filtros.batch_code}
			/>
		</div>
		<button type="button" class="btn rounded variant-filled mt-5 float-right" on:click={filtrar}
			>Filtrar</button
		>
		<div class="arrow variant-filled-secondary" />
	</div>
	<table class="table table-hover shadow-lg rounded-lg w-11/12 mx-auto">
		<thead>
			<tr>
				<th>ID</th>
				<th>Codigo</th>
				<th>Ingrediente</th>
				<th>Stock</th>
				<th>Fabricado con</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each listaFiltrada as batch}
				<tr class="align-middle">
					<td class="w-1/12 align-middle">{batch.id}</td>
					<td class="w-2/12">{batch.batch_code}</td>
					<td class="w-1/12">{batch.ingredient.name}</td>
					<td class="w-2/12">{batch.stock} {batch.ingredient.unit}</td>
					<td>{batch.used_batches.map((x) => x.batch_code).join(', ') || '-'}</td>

					<td class="w-1/12"
						><a class="btn p-0" href={`ingredientes/${batch.id.toString()}`}>Ver</a></td
					>
				</tr>
			{/each}
			<!-- this wierd reduce is because somtimes the backend returns less items because of how the limit works tihe the joins in the sql query-->
			{#if data.batches.reduce((acc, item) => acc + item.used_batches.length, 0) < data.page_size}
				{#each Array(data.page_size - data.batches.length) as _}
					<tr>
						<td><wbr /></td>
						<td />
						<td />
						<td />
						<td />
						<td />
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
	<div class="pt-4 mx-auto">
		<Paginator
			buttonClasses="p-4 bg-surface-400"
			settings={paginationSettings}
			showFirstLastButtons={true}
			showPreviousNextButtons={true}
			showNumerals
			maxNumerals={1}
			on:page={changePage}
		/>
	</div>
</main>
