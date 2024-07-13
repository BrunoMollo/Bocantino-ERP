<script>
	import InputDate from '$lib/ui/InputDate.svelte';
	import Spinner from '$lib/ui/Spinner.svelte';
	import { fade } from 'svelte/transition';
	import { superForm } from 'sveltekit-superforms/client';

	export let data;
	const { form, enhance, errors, delayed } = superForm(data.form, {
		dataType: 'json',
		taintedMessage: null,
		onError: ({ result }) => {
			alert('algo salio mal, llamar a soporte \n msj: ' + result.error.message);
		}
	});
</script>

<main class="container h-full mx-auto flex justify-center items-center">
	<article class="card p-4">
		<h2 class="h2">Agregar Factura (Id:{data.entry.id})</h2>
		<form class="flex flex-col gap-4 p-9" action="" method="post" use:enhance>
			<label for="invoice_number" class="label">
				<small class="my-auto mr-1 font-black text-lg"> Numero de Factura</small>
				<input
					class="input"
					class:error_border={$errors.invoice_number}
					type="text"
					id="invoice_number"
					bind:value={$form.invoice_number}
				/>
				{#if $errors.invoice_number}
					<b class=" text-error-400" transition:fade>{$errors.invoice_number}</b>
				{/if}
			</label>

			<label class="label" for="issue_date">
				<small class="my-auto mr-1 font-black text-lg">Fecha de Emision</small>
				<InputDate
					id="issue_date"
					className={`input ${$errors.issue_date ? 'error_border' : ''}`}
					bind:value={$form.issue_date}
				/>
				{#if $errors.issue_date}
					<b class=" text-error-400" transition:fade>{$errors.issue_date}</b>
				{/if}
			</label>

			<label class="label" for="due_date">
				<small class="my-auto mr-1 font-black text-lg">Fecha de Vencimiento</small>
				<InputDate
					id="due_date"
					className={`input ${$errors.due_date ? 'error_border' : ''}`}
					bind:value={$form.due_date}
				/>
				{#if $errors.due_date}
					<b class=" text-error-400" transition:fade>{$errors.due_date}</b>
				{/if}
			</label>

			<label for="iva_tax_percentage" class="label">
				<small class="my-auto mr-1 font-black text-lg">Iva (%)</small>
				<input
					class="input"
					class:error_border={$errors.iva_tax_percentage}
					type="number"
					step=".001"
					id="iva_tax_percentage"
					bind:value={$form.iva_tax_percentage}
				/>
				{#if $errors.iva_tax_percentage}
					<b class=" text-error-400" transition:fade>{$errors.iva_tax_percentage}</b>
				{/if}
			</label>

			<label for="withdrawal_tax_amount" class="label">
				<small class="my-auto mr-1 font-black text-lg">Percepciones ($)</small>
				<input
					class="input"
					class:error_border={$errors.withdrawal_tax_amount}
					type="number"
					step=".001"
					id="withdrawal_tax_amount"
					bind:value={$form.withdrawal_tax_amount}
				/>
				{#if $errors.withdrawal_tax_amount}
					<b class=" text-error-400" transition:fade>{$errors.withdrawal_tax_amount}</b>
				{/if}
			</label>

			<!-- TODO:FINISH COST INPUT -->
			<table>
				<thead>
					<tr>
						<th class="text-center">Materia Prima</th>
						<th class="text-center">Importe</th>
					</tr>
				</thead>
				<tbody class="w-11/12">
					{#each data.batches as { id, ingredient }, i}
						<tr>
							<td class="w-24">
								<div class="relative inline-block">
									<p>{ingredient}</p>
								</div>
							</td>
							<td class="w-24">
								<div class="relative inline-block">
									<input
										class="input w-24"
										type="number"
										step="0.01"
										bind:value={$form.batches[i]}
									/>
									<span class="suffix absolute right-3 top-1/4">$</span>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>

			<button type="submit" class="btn variant-filled-primary">
				<b> Agregar Factura</b>
				<Spinner showIf={$delayed} size={4} />
			</button>
		</form>
	</article>
</main>
