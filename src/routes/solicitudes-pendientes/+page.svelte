<script lang="ts">
	import InputDate from '$lib/ui/InputDate.svelte';
	import { startAs } from '$lib/utils.js';
	import { superForm } from 'sveltekit-superforms/client';

	export let data;

	const { form, enhance, delayed } = superForm(data.form, {
		dataType: 'json',
		clearOnSubmit: 'none',
		onSubmit: () => {
			dialog.close();
		}
	});

	let dialog: HTMLDialogElement;

	let focused_index = 0;
	function show(index: number) {
		startAs(form, 'loss', null);
		focused_index = index;
		dialog.showModal();
	}
	$: current = data.pending_productions[focused_index];
	$: $form.batch_id = current.id;
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

<dialog bind:this={dialog} class="absolute h-screen w-screen bg-transparent text-primary-100">
	<div class="card w-2/4 m-auto mt-14 shadow-lg rounded-lg">
		<button
			class="bg-black m-3 p-3 rounded-full h-12 w-12 align-middle shadow-md"
			on:click={() => dialog.close()}
		>
			<i class="bx bx-arrow-back text-2xl"></i>
		</button>
		<div class="px-10">
			<h2 class="h2 text-primary-200">Solicitud pendiente {current.id}</h2>
			<p>
				Cantidad producida: {current.initialAmount}
				{current.ingredient.unit} de {current.ingredient.name}.
			</p>
			{#each current.used_batches as used_batch}
				<p>
					Uso {used_batch.amount_used_to_produce_batch}
					{current.used_ingredient.unit} del lote {used_batch.batch_code}
				</p>
			{/each}

			<h3 class="h3 pt-4">Finalizar produccion</h3>
			<form class="flex flex-col" method="post" use:enhance>
				<div class="mb-4">
					<label class="label" for="loss">Merma:</label>
					<div>
						<input type="number" class="input w-40 mr-2" id="loss" bind:value={$form.loss} />
						<span>{current.ingredient.unit}</span>
					</div>
				</div>
				<div class="mb-4">
					<label class="label" for="loss">Fecha vencimiento:</label>
					<div>
						<InputDate bind:value={$form.expiration_date} className="input w-fit" />
					</div>
				</div>

				<div class="flex pb-7 pt-3 w-full justify-between">
					<button class="btn variant-filled-primary w-40" type="submit">
						{#if $delayed}
							Cerrando...
						{:else}
							Cerrar produccion
						{/if}
					</button>
					<button class="btn variant-filled-error w-40">
						{#if $delayed}
							Eliminando...
						{:else}
							Eliminar solicitud
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
</dialog>

<pre>
{JSON.stringify(data.pending_productions[0], null, 2)}
</pre>
