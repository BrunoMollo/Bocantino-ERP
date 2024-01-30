<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Paginator, type PaginationSettings } from '@skeletonlabs/skeleton';
	export let data;

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
</script>

<main class="container flex flex-col mx-auto pt-10 mb-10">
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

					<td class="w-1/12"><a class="btn p-0" href={`lotes/${batch.id.toString()}`}>Ver</a></td>
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
