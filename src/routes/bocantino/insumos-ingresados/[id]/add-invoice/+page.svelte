<script>
	import InputDate from '$lib/ui/InputDate.svelte';
	import Spinner from '$lib/ui/Spinner.svelte';
	import { superForm } from 'sveltekit-superforms/client';

	export let data;
	const { form, enhance, errors, delayed } = superForm(data.form, {
		dataType: 'json',
		taintedMessage: null,
		onError: ({ result }) => {
			alert('algo salio mal, llamar a soporte \n msj: ' + result.error.message);
		}
	});
	form.update((x) => {
		// @ts-expect-error Fuck you Superforms
		x.iva_tax_percentage = null;
		// @ts-expect-error Fuck you Superforms
		x.withdrawal_tax_amount = null;
		for (const { id } of data.batches) {
			// @ts-expect-error Fuck you Superforms
			x.batches.push({ batch_id: id, cost: null });
		}
		return x;
	});
</script>

<main class="container h-full mx-auto flex justify-center items-center">
	<article class="card p-4 w-[600px]">
		<h2 class="h2">Agregar Factura ( Ingreso: {data.entry.id} )</h2>
		<form class="flex flex-col gap-4 p-9" action="" method="post" use:enhance>
			<label for="invoice_number" class="label">
				<small class="my-auto mr-1 font-black text-lg"> Numero de Factura</small>
				<br />
				<input
					class="input w-60"
					class:error_border={$errors.invoice_number}
					type="text"
					id="invoice_number"
					bind:value={$form.invoice_number}
				/>
			</label>

			<label class="label" for="issue_date">
				<small class="my-auto mr-1 font-black text-lg">Fecha de Emision</small>
				<br />
				<InputDate
					id="issue_date"
					className={`input w-32 ${$errors.issue_date ? 'error_border' : ''}`}
					bind:value={$form.issue_date}
				/>
			</label>

			<label class="label" for="due_date">
				<small class="my-auto mr-1 font-black text-lg">Fecha de Vencimiento</small>
				<br />
				<InputDate
					id="due_date"
					className={`input w-32 ${$errors.due_date ? 'error_border' : ''}`}
					bind:value={$form.due_date}
				/>
			</label>

			<label for="iva_tax_percentage" class="label">
				<small class="my-auto mr-1 font-black text-lg">Iva (%)</small>
				<br />
				<select
					id="opciones"
					class="input select w-24"
					bind:value={$form.iva_tax_percentage}
					class:error_border={$errors.iva_tax_percentage}
				>
					<option value="0.21">21%</option>
					<option value="0.105">10,5%</option>
					<option value="0">0%</option>
				</select>
			</label>

			<label for="withdrawal_tax_amount" class="label">
				<small class="my-auto mr-1 font-black text-lg">Percepciones ($)</small>
				<br />
				<input
					class="input w-32"
					class:error_border={$errors.withdrawal_tax_amount}
					type="number"
					step=".001"
					id="withdrawal_tax_amount"
					bind:value={$form.withdrawal_tax_amount}
				/>
			</label>

			<small class="my-auto mr-1 font-black text-lg">Importes por lote</small>
			<ul class="flex flex-col gap-5">
				{#each data.batches as { ingredient, code }, i}
					{#if $form.batches[i]}
						<li class="relative flex flex-row align-baseline items-center gap-2">
							<div class="">Lote de {ingredient} ({code})</div>
							<div class="absolute inline-block right-0">
								<input
									class="input w-24"
									type="number"
									step="0.01"
									bind:value={$form.batches[i].cost}
									class:error_border={$errors.batches?.[i]}
								/>
								<span class="suffix absolute right-3 top-1/4">$</span>
							</div>
						</li>
					{/if}
				{/each}
			</ul>
			<button type="submit" class="btn variant-filled-primary">
				<b> Agregar Factura</b>
				<Spinner showIf={$delayed} size={4} />
			</button>
		</form>
	</article>
</main>
