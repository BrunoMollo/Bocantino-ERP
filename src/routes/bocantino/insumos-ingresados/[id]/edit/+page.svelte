<script lang="ts">
	import InputDate from '$lib/ui/InputDate.svelte';
	import { startAs } from '$lib/utils.js';
	import { superForm } from 'sveltekit-superforms/client';
	import Loader from '../../../_components/Loader.svelte';

	export let data;
	const { form, enhance, errors, delayed } = superForm(data.form, {
		onError: ({ result }) => alert(`ERROR: ${result.error.message}`),
		dataType: 'json',
		taintedMessage: null
	});

	$: selected_doc_type = data.document_types.find((x) => x.id === $form.idDocumentType);
	const { entry } = data;
	const doc_type_current = data.document_types.find((x) => x.desc === entry.document.type);
	startAs(form, 'idDocumentType', doc_type_current?.id);
</script>

<main class="container h-full mx-auto flex justify-center items-center">
	<div class="card p-6 w-4/6">
		<h2 class="h2">Editar Ingreso de Materia Prima {entry.id}</h2>
		<form class="flex flex-col gap-4 p-9 w-full" action="" method="post" use:enhance>
			<label class="label" for="document_type">
				<small class="my-auto mr-1 font-black text-lg">Tipo de documento</small>
				<select
					id="document_type"
					bind:value={$form.idDocumentType}
					class="select"
					class:error_border={$errors.idDocumentType}
				>
					{#each data.document_types as { id, desc }}
						<option value={id}>{desc}</option>
					{/each}
				</select>
			</label>

			<label class="label" for="invoice_number">
				<small class="my-auto mr-1 font-black text-lg">Numero de {selected_doc_type?.desc}</small>
				<input
					id="invoice_number"
					placeholder="Numero"
					type="text"
					bind:value={$form.invoiceNumber}
					class="input"
					class:error_border={$errors.invoiceNumber}
					aria-invalid={$errors.invoiceNumber ? 'true' : undefined}
				/>
			</label>

			<label class="label" for="issue_date">
				<small class="my-auto mr-1 font-black text-lg"> Fecha factura</small>
				<InputDate
					id="issue_date"
					className={`input ${$errors.issueDate ? 'error_border' : ''}`}
					bind:value={$form.issueDate}
				/>
			</label>

			<label class="label" for="due_date">
				<small class="my-auto mr-1 font-black text-lg">Vencimiento factura</small>
				<InputDate
					id="due_date"
					className={`input ${$errors.due_date ? 'error_border' : ''}`}
					bind:value={$form.due_date}
				/>
			</label>

			<div class="flex justify-end pt-4 gap-4">
				<a class="btn variant-ghost-surface" href={`/bocantino/insumos-ingresados/${entry.id}`}>
					<b>No editar</b>
				</a>
				<button class="btn variant-filled-primary" type="submit">
					{#if $delayed}
						<Loader />
					{:else}
						<b>Editar</b>
					{/if}
				</button>
			</div>
		</form>
	</div>
</main>
