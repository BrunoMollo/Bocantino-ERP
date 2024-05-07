<script lang="ts">
	import { fly } from 'svelte/transition';
	import { superForm } from 'sveltekit-superforms/client';
	import InputDate from '$lib/ui/InputDate.svelte';
	import Autocomplete from '$lib/ui/Autocomplete.svelte';
	import { makeOptions } from '$lib/utils.js';
	import { derived } from 'svelte/store';
	import Loader from '../../_components/Loader.svelte';
	import {
		derive_if_can_print_label,
		printBatchLabel
	} from '../../ingreso-insumos/_shared/pdf-batch-label';

	export let data;
	const { form, enhance, errors, delayed } = superForm(data.form, {
		onError: ({ result }) => alert(`ERROR: ${result.error.message}`),
		dataType: 'json',
		defaultValidator: 'clear',
		taintedMessage: null
	});

	$: total = subtotal + subtotal * $form.iva_tax_percentage + Number($form.withdrawal_tax_amount);
	let subtotal = 0;

	if ($form.batches.length === 0) {
		addLine();
	}

	function addLine() {
		form.update((f) => {
			//@ts-expect-error PENDING: explain
			f.batches.push({});
			return f;
		});
	}

	function removeLine(index: number) {
		form.update((f) => {
			if (f.batches.length > 1) {
				const newBatches = f.batches.filter((_, i) => i !== index);
				//@ts-expect-error PENDING: explain
				f.batches = newBatches;
			}
			return f;
		});
	}

	const optionsSuppliers = makeOptions(data.suppliers, { value: 'id', label: 'name' });

	const supplier_id = derived(form, (x) => x.supplier_id);
	const optionsIngredients = derived(supplier_id, (supplier_id) => {
		const selectedSupplier = data.suppliers.find((x) => x.id == Number(supplier_id));
		if (!selectedSupplier) {
			return [];
		}
		return selectedSupplier.ingredients;
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

	async function genearteCode(i: number) {
		form.update((f) => {
			f.batches[i].batch_code = `G-${f.invoiceNumber}-${i}`;
			return f;
		});
	}

	const unit = derived(
		[derived(form, (f) => f.supplier_id), derived(form, (f) => f.batches)],
		([$supplier_id, $batches]) => {
			return (index: number) => {
				const supplier = data.suppliers.find((x) => x.id == $supplier_id); // dont use ===
				if (!supplier) return '-' as const;
				const ingredient_id = $batches[index].ingredient_id;
				const ingredient = supplier.ingredients.find((x) => x.id == ingredient_id); // dont use ===
				if (!ingredient) return '-' as const;
				return ingredient.unit;
			};
		}
	);

	function actualizarCosto() {
		let variable = 0;
		$form.batches.forEach((element) => {
			variable += Number(element.cost);
		});
		subtotal = variable;
	}

	const can_print_label = derive_if_can_print_label(form);
</script>

<main class="container h-full mx-auto flex justify-center items-center">
	<form action="" method="post" use:enhance>
		<div class="grid grid-cols-5 gap-3 mx-auto">
			<div>
				<label class="label" for="supplier_id">
					<small class="my-auto mr-1 font-black text-lg">Proveedor</small>
				</label>
				<Autocomplete
					id="supplier_id"
					name="supplier_id"
					bind:value={$form.supplier_id}
					className="input truncate {$errors.supplier_id ? 'error_border' : ''}"
					{...optionsSuppliers}
				/>
			</div>
			<div>
				<label class="label ml-auto" for="invoice_number">
					<small class="my-auto mr-1 font-black text-lg">Numero de factura</small>
				</label>
				<input
					id="invoice_number"
					placeholder="Numero"
					type="text"
					bind:value={$form.invoiceNumber}
					class="input"
					class:error_border={$errors.invoiceNumber}
					aria-invalid={$errors.invoiceNumber ? 'true' : undefined}
				/>
			</div>
			<div>
				<label class="label" for="issue_date">
					<small class="my-auto mr-1 font-black text-lg"> Fecha factura</small>
				</label>
				<InputDate
					id="issue_date"
					className={`input ${$errors.issueDate ? 'error_border' : ''}`}
					bind:value={$form.issueDate}
				/>
			</div>

			<div>
				<label class="label" for="due_date">
					<small class="my-auto mr-1 font-black text-lg">Vencimiento factura</small>
				</label>
				<InputDate
					id="due_date"
					className={`input ${$errors.due_date ? 'error_border' : ''}`}
					bind:value={$form.due_date}
				/>
			</div>
		</div>
		<div class="table-container mx-auto my-5 shadow-lg rounded-lg" style="">
			<table class="table">
				<thead>
					<tr>
						<th class="text-center">Materia Prima</th>
						<th class="text-center">Cantidad</th>
						<th class="text-center">Bolsas</th>
						<th class="text-center w-32">Fecha produccion</th>
						<th class="text-center w-32">Fecha vencimiento</th>
						<th class="text-center w-24">Importe</th>
						<th class="text-center">Lote</th>
						<th class="text-center"></th>
					</tr>
				</thead>
				<tbody class="w-11/12">
					{#each $form.batches as _, i}
						<tr transition:fly={{ x: -350 }}>
							<td>
								<select
									class="select w-56"
									bind:value={$form.batches[i].ingredient_id}
									class:error_border={$batchesError(i, 'ingredient_id')}
									class:text-gray-500={$optionsIngredients.length == 0}
								>
									{#if $optionsIngredients.length == 0}
										<option disabled selected>Elija un proveedor</option>
									{/if}
									{#each $optionsIngredients as { id, name }}
										<option value={id}>{name}</option>
									{/each}
								</select>
							</td>
							<td>
								<div class="relative inline-block w-24">
									<input
										class="input"
										class:error_border={$batchesError(i, 'initial_amount')}
										type="text"
										bind:value={$form.batches[i].initial_amount}
									/>
									<span class="suffix absolute right-3 top-1/4">{$unit(i)}</span>
								</div>
							</td>
							<td>
								<div class="relative inline-block w-20">
									<input
										class="input"
										class:error_border={$batchesError(i, 'number_of_bags')}
										type="text"
										bind:value={$form.batches[i].number_of_bags}
									/>
								</div>
							</td>
							<td class="w-32">
								<div class="relative inline-block">
									<InputDate
										className={`input w-32 ${
											$batchesError(i, 'production_date') ? 'error_border' : ''
										}`}
										bind:value={$form.batches[i].production_date}
									/>
								</div>
							</td>
							<td>
								<div class="relative inline-block">
									<InputDate
										className={`input w-32 ${
											$batchesError(i, 'expiration_date') ? 'error_border' : ''
										}`}
										bind:value={$form.batches[i].expiration_date}
									></InputDate>
								</div>
							</td>
							<td class="w-24">
								<div class="relative inline-block">
									<input
										class="input w-24"
										type="number"
										step="0.01"
										class:error_border={$batchesError(i, 'cost')}
										bind:value={$form.batches[i].cost}
										on:input={actualizarCosto}
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
									<button
										type="button"
										class="group variant-filled-surface"
										on:click={() => genearteCode(i)}
									>
										<span class="">Generar</span>
									</button>
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
								<button
									type="button"
									class="btn-icon btn-icon-sm variant-soft-secondary mx-3"
									on:click={() => printBatchLabel($form.batches[i], $optionsIngredients)}
									disabled={$can_print_label(i)}
								>
									<i class="bx bxs-printer place-self-center text-xl" />
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
		<div class="flex mx-auto justify-between">
			<div class="flex">
				<h2 class="p-2">Subtotal:</h2>
				<div class="relative inline-block">
					<div class="input rounded p-2 w-36">{subtotal}</div>
					<span class="suffix absolute right-3 top-[20%]">$</span>
				</div>
			</div>
			<div class="flex">
				<h2 class="p-2">Iva:</h2>
				<select id="opciones" class="select w-24" bind:value={$form.iva_tax_percentage}>
					<option value="0.21">21%</option>
					<option value="0.105">10,5%</option>
					<option value="0">0%</option>
				</select>
			</div>
			<div class="flex align-middle">
				<h2 class="p-2">Percepciones:</h2>
				<div class="relative inline-block">
					<input type="text" class="input rounded w-28" bind:value={$form.withdrawal_tax_amount} />
					<span class="suffix absolute right-3 top-[20%]">$</span>
				</div>
			</div>
			<div class="w-1/2"></div>
		</div>
		<div class=" mx-auto flex justify-end">
			<div class="flex mr-10">
				<h1 class="p-2">Total:</h1>
				<div class="input w-32 p-2 rounded">
					{Math.round(total * 100) / 100}
				</div>
			</div>

			<div class="w-1/5 h-0 grid place-items-center">
				{#if $delayed}
					<Loader />
				{:else}
					<button type="submit" class="btn rounded-lg variant-filled-secondary w-full">
						Enviar
					</button>
				{/if}
			</div>
		</div>
	</form>
</main>
