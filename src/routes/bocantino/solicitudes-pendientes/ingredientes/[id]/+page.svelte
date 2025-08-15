<script lang="ts">
	import { goto } from '$app/navigation';
	import { superForm } from 'sveltekit-superforms/client';
	import { printIngredientBatchLabel } from '../../../ingreso-insumos/_shared/pdf-batch-label.js';
	export let data;
	const {
		form,
		enhance,
		delayed,
		errors,
		message: formMessage
	} = superForm(data.form, {
		taintedMessage: null,
		dataType: 'json',
		defaultValidator: 'clear',
		onError: ({ result }) => {
			if (result.type == 'error') {
				alert(result.error.message);
			}
		},

		onUpdated: ({ form }) => {
			if (form.message?.type === 'success') {
				const batchToPrint = form.message.batch;

				const question = `Lote ${batchToPrint.batch_code} finalizado con éxito.\n¿Deseas imprimir la etiqueta?`;

				if (confirm(question)) {
					printIngredientBatchLabel(data.batch);
				}
				goto('/bocantino/lotes/ingredientes');
			}
		}
	});

	const { enhance: cancel_enhance } = superForm(data.cancel_form, {
		// ... (el formulario de cancelación no necesita cambios)
	});
</script>

<div class="card w-9/12 md:w-2/4 m-auto mt-14 shadow-lg rounded-lg">
	<a
		href="/bocantino/solicitudes-pendientes/ingredientes"
		class="block card shadow m-3 p-3 rounded-full h-12 w-12 align-middle"
	>
		<i class="bx bx-arrow-back text-2xl"></i>
	</a>
	<div class="px-10">
		<h2 class="h2 my-5">Solicitud pendiente {data.batch.id}</h2>
		<p>
			Producción estimada: <span class="font-bold"
				>{data.batch.initial_amount}
				{data.batch.ingredient.unit}</span
			>
			de {data.batch.ingredient.name}.
		</p>
		<p>
			Uso <span class="font-bold"
				>{data.used_batch.amount_used_to_produce_batch}
				{data.used_batch.ingredient_unit}</span
			>
			del lote {data.used_batch.batch_code}
		</p>

		<h3 class="h3 pt-4">Finalizar produccion</h3>
		<form class="flex flex-col" method="post" action="?/finish" use:enhance>
			<div class="mb-4 flex align-middle items-center gap-3">
				<label class="label py-auto" for="adjustment">Cantidad real producida:</label>
				<div>
					<input
						type="number"
						step=".01"
						class="input w-40 mr-2"
						id="adjustment"
						bind:value={$form.real_production}
						class:error_border={$errors.real_production}
					/>
					<span>{data.batch.ingredient?.unit}</span>
				</div>
			</div>

			<div class="flex pb-7 pt-3 w-full justify-between">
				<button class="btn variant-filled-primary w-40 rounded" type="submit">
					{#if $delayed}
						Cerrando...
					{:else}
						Ingresar a Stock
					{/if}
				</button>

				<form action="?/cancel" method="post" use:cancel_enhance>
					<button
						class="btn variant-filled-error rounded w-40"
						type="submit"
						on:click={(event) => {
							const question =
								'Estas seguro que quieres eliminar este lote?\nEsta accion no se puede deshacer';
							if (!confirm(question)) {
								event.preventDefault();
							}
						}}
					>
						Eliminar Solicitud
					</button>
				</form>
			</div>
		</form>
	</div>
</div>
