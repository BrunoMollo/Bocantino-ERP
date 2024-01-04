<script lang="ts">
	export let data;
</script>

<h1 class="text-center w-full uppercase text-2xl my-5">Solicitudes pendientes</h1>

<table class="table w-11/12 mx-auto p-2 rounded-md shadow-lg">
	<thead>
		<tr>
			<th>ID Produccion</th>
			<th>Ingrediente a producir</th>
			<th>Cantidad a producir</th>
			<th></th>
		</tr>
	</thead>
	<tbody>
		{#each data.pending_productions as item}
			<tr>
				<!-- <p>{JSON.stringify(item)}</p> -->
				<td>{item.id}</td>
				<td>{item.producedIngredient.name}</td>
				<td>{item.producedAmount} {item.producedIngredient.unit}</td>
				<td></td>
			</tr>
		{/each}
	</tbody>
</table>
