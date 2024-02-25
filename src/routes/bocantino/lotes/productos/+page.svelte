<script lang="ts">
	import CompleteTable from '../../_components/complete-table.svelte';

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
		{/each}
		<CompleteTable list={data.product_batches} rows={8} />
	</tbody>
</table>

