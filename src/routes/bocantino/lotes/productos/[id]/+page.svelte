<script lang="ts">
	export let data;
</script>

<main>
	<section class="w-4/6 mx-auto card p-5 rounded-lg shadow-md">
		<a href="./">
			<div>
				<button class="m-3 p-3 rounded-full h-12 w-12 align-middle shadow-md card"
					><i class="bx bx-arrow-back text-2xl"></i></button
				>
			</div>
		</a>
		<h1 class="text-2xl pb-3">
			Resumen lote numero:
			{data.productBatch.id}
		</h1>
		<p class="text-xl">
			<span class="font-bold">Codigo:</span>
			{data.productBatch.batch_code}
		</p>
		<p class="text-xl"><span class="font-bold">Producto:</span> {data.productBatch.product.desc}</p>
		<p class="text-xl">
			<span class="font-bold">Cantidad producida:</span>
			{data.productBatch.initial_amount + (data.productBatch.adjustment ?? 0)} Kg
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
			<p>
				<span class="font-bold"
					>Fecha elaboracion:
				</span>{data.productBatch.production_date?.toLocaleDateString('es')}
			</p>
			<p>
				<span class="font-bold">Fecha vencimiento: </span>
				{data.productBatch.expiration_date.toLocaleDateString('es')}
			</p>
		</div>
	</section>
</main>
