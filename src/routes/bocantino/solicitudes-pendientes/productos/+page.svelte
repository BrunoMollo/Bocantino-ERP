<script lang="ts">
	import { startAs } from '$lib/utils.js';
	import { fade } from 'svelte/transition';
	import { superForm } from 'sveltekit-superforms/client';
	import { generarPDF } from '../_shared/generar_orden_produccion.js';
	import { IconPaperBag } from '@tabler/icons-svelte';

	export let data;

	const { form, enhance, delayed, errors } = superForm(data.form, {
		taintedMessage: null,
		dataType: 'json', // needed for id
		defaultValidator: 'clear',
		onError: ({ result }) => {
			if (result.type == 'error') {
				alert(result.error.message);
			}
			dialog.close();
		},
		onUpdated: ({ form }) => {
			if (form.valid) {
				dialog.close();
			}
		}
	});

	const { form: cancel_form, enhance: cancel_enhance } = superForm(data.cancel_form, {
		taintedMessage: null,
		defaultValidator: 'clear',
		dataType: 'json', // needed for id
		onError: ({ result }) => {
			if (result.type == 'error') {
				alert(result.error.message);
			}
			dialog.close();
		},
		onUpdated: ({ form }) => {
			if (form.valid) {
				dialog.close();
			}
		}
	});

	let dialog: HTMLDialogElement;
	let form_el: HTMLFormElement;

	let focused_index = -1;
	function show(index: number) {
		focused_index = index;
		$errors = {};
		form_el.reset();
		startAs(form, 'adjustment', null);
		dialog.showModal();
	}
	$: current = data.pending_productions[focused_index];
	$: $form.batch_id = current?.id ?? -1;
	$: $cancel_form.batch_id = current?.id ?? -1;
</script>

<h1 class="text-center w-full uppercase text-2xl my-5">
	Ordenes de producción en proceso: Productos
</h1>

<table class="table w-11/12 mx-auto p-2 rounded-md shadow-lg">
	<thead>
		<tr>
			<th class="w-1/4">ID Produccion</th>
			<th class="w-1/4">Producto a producir</th>
			<th class="w-1/4">Cantidad a producir</th>
			<th class="w-1/4"></th>
		</tr>
	</thead>
	<tbody>
		{#each data.pending_productions as item, i}
			<tr out:fade>
				<td class="p-4">{item.id}</td>
				<td class="p-4">{item.product.desc}</td>
				<td class="p-4">{item.initial_amount} Kg</td>
				<td class="gap-5 flex p-4">
					<button on:click={() => show(i)}>ver</button>
					<!-- TODO: generate pdf-->
					<button
						class="rounded-full bg-white px-3 py-2"
						on:click={generarPDF(item.product.desc, item)}
						><i class="bx bx-printer text-xl text-black h-5 w-5"></i></button
					>
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<dialog bind:this={dialog} class="absolute h-screen w-screen bg-transparent text-primary-100">
	<div class="card w-9/12 md:w-2/4 m-auto mt-14 shadow-lg rounded-lg">
		<button
			class="bg-black m-3 p-3 rounded-full h-12 w-12 align-middle shadow-md"
			on:click={() => dialog.close()}
		>
			<i class="bx bx-arrow-back text-2xl"></i>
		</button>
		<div class="px-10">
			<h2 class="h2 text-primary-200">Solicitud pendiente {current?.id}</h2>
			<p class="text-xl">
				Producto: {current?.product.desc}
			</p>
			<p class="text-xl">
				Cantidad producida: {current?.initial_amount} Kg de
			</p>
			<dl class="list-dl">
				{#each current?.used_batches ?? [] as { ingredient_name, ingredient_unit, amount_used_to_produce_batch, batch_code }}
					<div>
						<span class="badge p-2 bg-surface-500"><IconPaperBag /></span>
						<span class="flex-auto">
							<dt class="text-l">
								{amount_used_to_produce_batch}
								{ingredient_unit} de {ingredient_name}
							</dt>
							<dd class="opacity-50">Lote : {batch_code}</dd>
						</span>
					</div>
				{/each}
			</dl>

			<h3 class="h3 pt-4">Finalizar produccion</h3>
			<form bind:this={form_el} class="flex flex-col" method="post" action="?/finish" use:enhance>
				<div class="mb-4">
					<label class="label" for="loss">Ajuste:</label>
					<div>
						<input
							type="number"
							class="input w-40 mr-2"
							id="adjustment"
							bind:value={$form.adjustment}
							class:error_border={$errors.adjustment}
						/>
						<span>Kg</span>
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

					<form action="?/cancel" method="post" use:cancel_enhance>
						<button
							class="btn variant-filled-error w-40"
							type="submit"
							on:click={(event) => {
								$cancel_form.batch_id = current?.id; // other from reset this
								const question =
									'Estas seguro que quieres eliminar este lote?\nEsta accion no se puede deshacer';
								if (!confirm(question)) {
									event.preventDefault();
								}
							}}
						>
							Eliminar solicitud
						</button>
					</form>
				</div>
			</form>
		</div>
	</div>
</dialog>

