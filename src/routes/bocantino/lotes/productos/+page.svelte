<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

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

	function changePage({ detail }: { detail: number }) {
		let query = new URLSearchParams($page.url.searchParams.toString());
		query.set('page', detail.toString());
		goto(`?${query.toString()}`);
	}

	const query = new URLSearchParams($page.url.searchParams.toString());

	const filters = {
		batch_code: $page.url.searchParams.get('batch_code'),
		ingredient_name: $page.url.searchParams.get('ingredient_name')
	};

	async function filtrar() {
		for (let key in filters) {
			//@ts-ignore
			const value = filters[key];
			if (value) {
				query.set(key, value);
			} else {
				query.delete(key);
			}
		}
		goto(`?${query.toString()}`);
	}
	function closeOnEnterKeyPress({ key }: { key: string }) {
		//@ts-ignore
		if (key == 'Enter') document.querySelector('#filter-btn')?.click();
	}
	async function clear_filters() {
		filters.batch_code = '';
		filters.ingredient_name = '';
		await filtrar();
	}
</script>

<main class=" container flex flex-col mx-auto pt-10">
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
			<p>Producto:</p>
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
			on:click={() => filtrar()}
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
				<th>Producto</th>
				<th>Elaboracion</th>
				<th>Vencimiento</th>
				<th>Fabricado con</th>
				<th>Estado</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each data.product_batches as batch}
				{#if batch != undefined}
					<tr class="align-middle">
						<td class="">{batch.id}</td>
						<td class="">{batch.batch_code}</td>
						<td class="">{batch.product.desc}</td>
						<td class="">{batch.production_date?.toLocaleDateString()}</td>
						<td class="">{batch.expiration_date?.toLocaleDateString()}</td>

						<td class="divide-y-2 divide-slate-400 divide-dashed">
							<!-- To be honest y think that this information should be on Detalles screen, cause it expands a lot the row-->
							{#each batch.used_batches as used_batch}
								<div class="py-1">
									{used_batch.ingredient_name}<br />
									Lote:
									{used_batch.batch_code}<br />
								</div>
							{/each}
						</td>
						<td class="w-1/12">{batch.state}</td>
						<td class="w-2/12">
							<div class="flex w-11/12 justify-end">
								<button class="btn variant-filled-primary rounded">Detalles</button>
							</div></td
						>
					</tr>
				{/if}
			{/each}
			<CompleteTable list={data.product_batches} rows={8} />
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
