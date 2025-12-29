<script lang="ts">
	import { page } from '$app/stores';
	import { make_filter_by_url } from '$lib/utils.js';

	import { Paginator, type PaginationSettings } from '@skeletonlabs/skeleton';
	import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
	import CompleteTable from '../../_components/complete-table.svelte';
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

	const { filter, filters } = make_filter_by_url(['batch_code', 'ingredient_name'], $page);

	function closeOnEnterKeyPress({ key }: { key: string }) {
		//@ts-expect-error PENDING: explain
		if (key == 'Enter') document.querySelector('#filter-btn')?.click();
	}

	async function clear_filters() {
		filters.batch_code = '';
		filters.ingredient_name = '';
		await filter();
	}

	type States = (typeof data.product_batches)[0]['state'];
	function display_state(state: States) {
		switch (state) {
			case 'IN_PRODUCTION':
				return 'EN PRODUCION';
			case 'AVAILABLE':
				return 'DISPONIBLE';
			case 'EMPTY':
				return 'VACIO';
		}
	}
</script>

<main class=" container flex flex-col mx-auto pt-10">
	<div class="w-11/12 mx-auto">
		<div
			class="rounded-full bg-slate-950 w-1/4 flex justify-between py-4 px-6 mb-8 mx-auto"
			use:popup={popupClick}
		>
			<p class="mr-10">Filtrar...</p>
			<i class="bx bx-search-alt text-white text-2xl"></i>
		</div>
	</div>

	<div class="card p-4 shadow-xl w-80 rounded" data-popup="popupClick">
		<h1 class="text-center w-full">Filtros</h1>
		<div class="">
			<p>Producto:</p>
			<input
				type="text"
				class="input rounded"
				placeholder="Ingrese el producto..."
				bind:value={filters.ingredient_name}
				on:keypress={closeOnEnterKeyPress}
			/>
		</div>
		<div class="">
			<p>Codigo lote:</p>
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
		<div class="arrow bg-surface-100-800-token" />
	</div>

	<table class="table table-hover shadow-lg rounded-lg w-11/12 mx-auto">
		<thead>
			<tr>
				<th>ID</th>
				<th>Codigo</th>
				<th>Producto</th>
				<th>Elaboracion</th>
				<th>Vencimiento</th>
				<th>Estado</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each data.product_batches as batch}
				<tr>
					<td>{batch.id}</td>
					<td>{batch.batch_code}</td>
					<td>{batch.product.desc}</td>
					<td>{batch.production_date?.toLocaleDateString('es')}</td>
					<td>{batch.expiration_date?.toLocaleDateString('es')}</td>
					<td>{display_state(batch.state)}</td>
					<td>
						<button class="btn variant-filled-primary rounded">
							<a href={`productos/${batch.id.toString()}`}>Detalles</a>
						</button>
					</td>
				</tr>
			{/each}
			<CompleteTable list={data.product_batches} rows={7} />
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
