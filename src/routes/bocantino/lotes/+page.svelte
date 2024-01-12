<script lang="ts">
	export let data;
</script>

<main class="container pt-6 pb-24 flex justify-center items-center">
	<table class="table table-hover shadow-lg rounded-lg w-11/12">
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
					<td>{batch.used_batches.map((x) => x.batch_code).join(', ')}</td>

					<td class="w-1/12"><button class="btn">Ver</button></td>
				</tr>
			{/each}
			{#if 10 - data.batches.length > 0}
				{#each Array(10 - data.batches.length) as _}
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
</main>

