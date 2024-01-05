<script lang="ts">
	export let data;

	let dialog: HTMLDialogElement;

	let focused_index = 0;
	function show(index: number) {
		focused_index = index;
		dialog.showModal();
	}
	$: current = data.pending_productions[focused_index];
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
		{#each data.pending_productions as item, i}
			<tr>
				<td>{item.id}</td>
				<td>{item.ingredient.name}</td>
				<td>{item.initialAmount} {item.ingredient.unit}</td>
				<td><button on:click={() => show(i)}>ver</button></td>
			</tr>
		{/each}
	</tbody>
</table>

<dialog bind:this={dialog} class="absolute h-screen w-screen bg-transparent">
	<div class="card w-8/12 h-3/4 m-auto mt-14 p-4">
		<h2 class="h2 text-primary-200">Solicitud pendiente {current.id}</h2>
		<p class="text-primary-100">
			Cantidad producida {current.initialAmount}
			{current.ingredient.unit}
		</p>
		{#each current.used_batches as used_batch}
			<p class="text-primary-100">
				Uso {used_batch.amount_used_to_produce_batch}{current.used_ingredient.unit} del lote {used_batch.batch_code}
			</p>
		{/each}
	</div>
</dialog>

<pre>
{JSON.stringify(data.pending_productions[0], null, 2)}
</pre>

