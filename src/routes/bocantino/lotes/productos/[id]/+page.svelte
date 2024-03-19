<script lang="ts">
	export let data;
</script>

<main>
	<section class="w-4/6 mx-auto bg-slate-700 p-5 rounded-lg shadow-md">
		<h1 class="text-2xl pb-3">Resumen lote numero: {data.productBatch.id}</h1>
		<p class="text-xl">Codigo: {data.productBatch.batch_code}</p>
		<p class="text-xl">Producto: {data.productBatch.product.desc}</p>
		<p class="text-xl">
			Cantidad producida: {data.productBatch.initial_amount + (data.productBatch.adjustment ?? 0)} Kg
		</p>
		<table class="table rounded my-3">
			<thead>
				<tr>
					<th>Id</th>
					<th>Codigo lote</th>
					<th>Ingrediente</th>
					<th>Cantidad usada</th>
				</tr>
			</thead>
			<tbody>
				{#each data.productBatch.used_batches as used_batch}
					<tr>
						<td>{used_batch.id}</td>
						<td>{used_batch.batch_code}</td>
						<td>{used_batch.ingredient_name}</td>
						<td>{used_batch.amount_used_to_produce_batch}</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<div class="flex gap-14">
			<p>Fecha elaboracion:{data.productBatch.production_date?.toLocaleDateString('es')}</p>
			<p>Fecha vencimiento: {data.productBatch.expiration_date.toLocaleDateString('es')}</p>
		</div>
	</section>
</main>
