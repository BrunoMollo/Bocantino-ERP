<script lang="ts">
	import { fly } from 'svelte/transition';
	import { dateProxy, superForm } from 'sveltekit-superforms/client';
	import InputDate from '$lib/ui/InputDate.svelte';
	import Autocomplete from '$lib/ui/Autocomplete.svelte';
	import { makeOptions } from '$lib/utils.js';
	import { derived } from 'svelte/store';

	export let data;
	const { form, enhance, errors } = superForm(data.form, {
		dataType: 'json',
		defaultValidator: 'clear'
	});

	if ($form.batches.length === 0) {
		addLine();
	}

	function addLine() {
		form.update((f) => {
			//@ts-ignore
			f.batches.push({});
			return f;
		});
	}

	function removeLine(index: number) {
		form.update((f) => {
			if (f.batches.length > 1) {
				const newBatches = f.batches.filter((_, i) => i !== index);
				//@ts-ignore
				f.batches = newBatches;
			}
			return f;
		});
	}

	const optionsDocumentTypes = makeOptions(data.documentTypes, { value: 'id', label: 'desc' });

	const optionsSuppliers = makeOptions(data.suppliers, { value: 'id', label: 'name' });

	const optionsIngredients = derived(form, ({ supplierId }) => {
		const selectedSupplier = data.suppliers.find((x) => x.id == Number(supplierId));
		if (!selectedSupplier) {
			return { labels: [], values: [] };
		}
		return makeOptions(selectedSupplier.ingredients, { value: 'id', label: 'name' });
	});

	// This shit could be removed with Svelte 5 support of ts in markdown
	const batchesError = derived(
		errors,
		({ batches }) =>
			(i: number, key: keyof (typeof $form.batches)[0]) => {
				if (batches && batches[i]) {
					return batches[i][key];
				}
			}
	);
</script>

<main class="container h-full mx-auto flex justify-center items-center">
	<form action="" method="post" use:enhance>
		<div class="grid grid-cols-4 gap-3 w-11/12 mx-auto">
			<div>
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">
					<small class="my-auto mr-1 font-black text-lg">Proveedor</small>
					<Autocomplete
						name="supplierId"
						bind:value={$form.supplierId}
						className="input {$errors.supplierId ? 'error_border' : ''}"
						{...optionsSuppliers}
					/>
				</label>
			</div>
			<div>
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">
					<small class="my-auto mr-1 font-black text-lg">Tipo de documento</small>
					<Autocomplete
						placeholder="Seleccionar..."
						name="tipe_of_document"
						bind:value={$form.idDocumentType}
						className={`input ${$errors.idDocumentType ? 'error_border' : ''}`}
						{...optionsDocumentTypes}
					/>
				</label>
			</div>
			<div>
				<label class="label ml-auto">
					<small class="my-auto mr-1 font-black text-lg">Numero de factura</small>
					<input
						type="text"
						bind:value={$form.invoiceNumber}
						class="input"
						class:error_border={$errors.invoiceNumber}
						aria-invalid={$errors.invoiceNumber ? 'true' : undefined}
					/>
				</label>
			</div>
			<div>
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">
					<small class="my-auto mr-1 font-black text-lg"> Fecha factura</small>
					<InputDate
						className={`input ${$errors.issueDate ? 'error_border' : ''}`}
						bind:value={$form.issueDate}
					/>
				</label>
			</div>
		</div>
		<div class="table-container w-11/12 mx-auto my-5 shadow-lg rounded-lg" style="">
			<table class="table">
				<thead>
					<tr>
						<th class="text-center">Materia Prima</th>
						<th class="text-center">Cantidad</th>
						<th class="text-center">Bolsas</th>
						<th class="text-center w-32">Fecha produccion</th>
						<th class="text-center w-32">Fecha vencimiento</th>
						<th class="text-center w-24">Monto</th>
						<th class="text-center">Codigo</th>
						<th class="text-center"></th>
					</tr>
				</thead>
				<tbody>
					{#each $form.batches as _, i}
						<tr transition:fly={{ x: -350 }}>
							<td>
								<!-- svelte-ignore a11y-label-has-associated-control -->
								<label class="label w-52">
									{#key $form.supplierId}
										<Autocomplete
											className={`input ${$batchesError(i, 'ingredientId') ? 'error_border' : ''}`}
											name={`ingredientId-${i}`}
											bind:value={$form.batches[i].ingredientId}
											{...$optionsIngredients}
										/>
									{/key}
								</label>
							</td>
							<td>
								<div class="relative inline-block w-24">
									<input
										class="input"
										class:error_border={$batchesError(i, 'initialAmount')}
										type="text"
										bind:value={$form.batches[i].initialAmount}
									/>
									<span class="suffix absolute right-3 top-1/4">kg.</span>
								</div>
							</td>
							<td>
								<div class="relative inline-block w-20">
									<input
										class="input"
										class:error_border={$batchesError(i, 'numberOfBags')}
										type="text"
										bind:value={$form.batches[i].numberOfBags}
									/>
								</div>
							</td>
							<td class="w-32">
								<div class="relative inline-block">
									<InputDate
										className={`input w-32 ${
											$batchesError(i, 'productionDate') ? 'error_border' : ''
										}`}
										bind:value={$form.batches[i].productionDate}
									/>
								</div>
							</td>
							<td>
								<div class="relative inline-block">
									<InputDate
										className={`input w-32 ${
											$batchesError(i, 'expirationDate') ? 'error_border' : ''
										}`}
										bind:value={$form.batches[i].expirationDate}
									></InputDate>
								</div>
							</td>
							<td class="w-24">
								<div class="relative inline-block">
									<input
										class="input w-24"
										type="text"
										class:error_border={$batchesError(i, 'cost')}
										bind:value={$form.batches[i].cost}
									/>
									<span class="suffix absolute right-3 top-1/4">$</span>
								</div>
							</td>
							<td>
								<div class="input-group input-group-divider grid-cols-[auto_auto] w-70">
									<input
										type="text"
										class="input"
										class:error_border={$batchesError(i, 'batch_code')}
										bind:value={$form.batches[i].batch_code}
									/>
									<button type="button" class="variant-filled-surface">Autogenerar</button>
								</div>
							</td>
							<td class="flex align-middle h-full mt-1 mr-1">
								<button
									type="button"
									class="btn-icon btn-icon-sm variant-soft-secondary"
									disabled={$form.batches.length === 1}
									on:click={() => removeLine(i)}
								>
									<i class="bx bxs-trash place-self-center text-xl" />
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
			<div class="w-full flex justify-end p-3 bg-gray-600">
				<button
					type="button"
					class="btn variant-filled-secondary rounded-lg"
					style="color:white;"
					on:click={addLine}>Agregar Renglon</button
				>
			</div>
		</div>
		<div class="w-11/12 mx-auto flex justify-end">
			<button type="submit" class="btn rounded-lg variant-filled-secondary w-1/5">Enviar</button>
		</div>
	</form>
</main>
