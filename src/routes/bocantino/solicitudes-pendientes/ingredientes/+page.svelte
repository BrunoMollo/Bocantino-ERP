<script lang="ts">
	import { startAs } from '$lib/utils.js';
	import { fade } from 'svelte/transition';
	import { superForm } from 'sveltekit-superforms/client';
	import { jsPDF } from 'jspdf';
	import autoTable from 'jspdf-autotable';

	export let data;
	const fechaHoy = new Date();
	const año = fechaHoy.getFullYear();
	const mes = fechaHoy.getMonth() + 1;
	const dia = fechaHoy.getDate();
	const fechaFormateada = `${año}-${mes < 10 ? '0' + mes : mes}-${dia < 10 ? '0' + dia : dia}`;

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
		$errors = {};
		form_el.reset();
		startAs(form, 'adjustment', null);
		focused_index = index;
		dialog.showModal();
	}
	$: current = data.pending_productions[focused_index];
	$: $form.batch_id = current?.id ?? -1;
	$: $cancel_form.batch_id = current?.id ?? -1;

	function generarPDF(item: any) {
		const doc = new jsPDF();
		doc.text('Solicitud de produccion numero:' + item.id, 10, 10);
		doc.text(fechaFormateada, 170, 10);
		doc.setLineWidth(0.75);
		doc.line(10, 13, 200, 13);
		doc.text(
			'Cantidad a producir:' + item.initial_amount + ' de ' + item.ingredient.name + '.',
			10,
			23
		);

		autoTable(doc, {
			styles: {
				fontSize: 20
			},
			margin: { top: 30 },
			head: [['Cantidad utilizada', 'Numero lote']],
			body: item.used_batches.map(
				(x: {
					amount_used_to_produce_batch: { toString: () => any };
					batch_code: { toString: () => any };
				}) => {
					return [x.amount_used_to_produce_batch.toString(), x.batch_code.toString()];
				}
			)
		});
		doc.text('©' + año + 'BOCANTINO. Todos los derechos reservados.', 10, 290);
		doc.autoPrint({ variant: 'non-conform' });
		doc.save('Solicitud' + item.id + '.pdf');
		return null;
	}
</script>

<h1 class="text-center w-full uppercase text-2xl my-5">
	Ordenes de producción en proceso: Ingredientes
</h1>

<table class="table w-11/12 mx-auto p-2 rounded-md shadow-lg">
	<thead>
		<tr>
			<th class="w-1/4">ID Produccion</th>
			<th class="w-1/4">Ingrediente a producir</th>
			<th class="w-1/4">Cantidad a producir</th>
			<th class="w-1/4"></th>
		</tr>
	</thead>
	<tbody>
		{#each data.pending_productions as item, i}
			<tr out:fade>
				<td style="padding-left: 16px;">{item.id}</td>
				<td style="padding-left: 16px;">{item.ingredient.name}</td>
				<td style="padding-left: 16px;">{item.initial_amount} {item.ingredient.unit}</td>
				<td style="padding-left: 16px;" class="gap-5 flex">
					<button on:click={() => show(i)}>ver</button>
					<button class="rounded-full bg-white px-3 py-2" on:click={generarPDF(item)}
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
			<p>
				Cantidad producida: {current?.initial_amount}
				{current?.ingredient?.unit} de {current?.ingredient.name}.
			</p>
			{#each current?.used_batches ?? [] as used_batch}
				<p>
					Uso {used_batch?.amount_used_to_produce_batch}
					{current?.used_ingredient.unit} del lote {used_batch?.batch_code}
				</p>
			{/each}

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
						<span>{current?.ingredient?.unit}</span>
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
								$cancel_form.batch_id = current.id; // other from reset this
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

