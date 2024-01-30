<script lang="ts">
	export let data;
</script>

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
			<tr class="align-middle">
				<td class="">{batch.id}</td>
				<td class="">{batch.batch_code}</td>
				<td class="">{batch.product.desc}</td>
				<td class="">{batch.production_date?.toLocaleDateString()}</td>
				<td class="">{batch.expiration_date?.toLocaleDateString()}</td>

				<td>
					{#each batch.used_batches as used_batch}
						{used_batch.ingredient_name}
					{/each}
				</td>
				<td class="w-1/12">{batch.state}</td>
				<td class="w-2/12"></td>
			</tr>
		{/each}
	</tbody>
</table>
