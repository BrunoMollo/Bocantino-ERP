<script lang="ts">
	import { page } from '$app/stores';
	import { Paginator, type PaginationSettings } from '@skeletonlabs/skeleton';
	import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
	import CompleteTable from '../../_components/complete-table.svelte';
	import { make_filter_by_url } from '$lib/utils';
	export let data;

	const popupClick: PopupSettings = {
		event: 'click',
		target: 'popupClick',
		placement: 'bottom'
	};

	const paginationSettings = {
		page: Number($page.url.searchParams.get('page')) || 0,
		limit: data.page_size,
		size: data.count_batches,
		amounts: []
	} satisfies PaginationSettings;

	const { filters, filter } = make_filter_by_url(['batch_code', 'ingredient_name'], $page);

	function closeOnEnterKeyPress({ key }: { key: string }) {
		//@ts-expect-error PENDING: explain
		if (key == 'Enter') document.querySelector('#filter-btn')?.click();
	}

	async function clear_filters() {
		filters.batch_code = '';
		filters.ingredient_name = '';
		await filter();
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
				bind:value={filters.ingredient_name}
				on:keypress={closeOnEnterKeyPress}
			/>
		</div>
		<div class="">
			<p>Codigo:</p>
			<input
				type="text"
				class="input rounded"
				placeholder="Ingrese el codigo..."
				bind:value={filters.batch_code}
				on:keypress={closeOnEnterKeyPress}
			/>
		</div>

		<button
			type="button"
			class="btn rounded variant-filled. mt-5 float-left"
			on:click={clear_filters}
		>
			Limpiar
		</button>
		<button
			id="filter-btn"
			type="button"
			class="btn rounded variant-filled mt-5 float-right"
			on:click={() => filter()}
		>
			Filtrar
		</button>
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
			{#each data.batches as batch}
				<tr class="align-middle">
					<td class="w-1/12 align-middle">{batch.id}</td>
					<td class="w-2/12">{batch.batch_code}</td>
					<td class="w-1/12">{batch.ingredient.name}</td>
					<td class="w-2/12">{batch.stock} {batch.ingredient.unit}</td>
					<td>{batch.used_batches.map((x) => x.batch_code).join(', ') || '-'}</td>

					<td class="w-1/12">
						<a class="btn p-0" href={`ingredientes/${batch.id.toString()}`}>Ver</a>
					</td>
				</tr>
			{/each}
			<CompleteTable list={data.batches} rows={6} />
		</tbody>
	</table>
	<div class="pt-4 mx-auto">
		<Paginator
			settings={paginationSettings}
			showFirstLastButtons={true}
			on:page={filter}
			showPreviousNextButtons={true}
		/>
	</div>
</main>
