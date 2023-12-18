<script lang="ts">
	import { fly } from 'svelte/transition';
	import { dateProxy, superForm } from 'sveltekit-superforms/client';
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
	import InputDate from '$lib/ui/InputDate.svelte';
	import Autocomplete from '$lib/ui/Autocomplete.svelte';

	export let data;
	const { EMPTY_BAG } = data;
	const { form, enhance, errors } = superForm(data.form, { dataType: 'json' });
	const proxyDate = dateProxy(form, 'issueDate', { format: 'date' });

	function addLine() {
		form.update((f) => {
			f.bags.push({ ...EMPTY_BAG });
			return f;
		});
	}
	let inputValue = '';

	function formatAndInsertSlash() {
		const cleanedValue = inputValue.replace(/\D/g, '');
		const firstTwo = cleanedValue.substring(0, 2);
		const nextTwo = cleanedValue.substring(2, 4);
		const lastFour = cleanedValue.substring(4, 8);
		inputValue = `${firstTwo}/${nextTwo}/${lastFour}`;
	}

	function removeLine(index: number) {
		form.update((f) => {
			if (f.bags.length > 1) {
				//@ts-ignore
				f.bags = f.bags.filter((_, i) => i !== index);
			}
			return f;
		});
	}
</script>

<form action="" method="post" use:enhance>
	<div class="grid grid-cols-4 gap-3 w-11/12 mx-auto">
		<div>
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">
				<small class="my-auto mr-1 font-black text-lg">Proveedor</small>
				<Autocomplete
					name="supplierId"
					bind:value={$form.supplierId}
					className="input {$errors.supplierId ? 'input-error' : ''}"
					labels={['Juan', 'Pedro', 'Martin']}
					values={[1, 2, 3]}
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
					bind:value={$form.supplierId}
					className="input {$errors.supplierId ? 'input-error' : ''}"
					labels={['Remito', 'Factura', 'Nota de compra']}
					values={[1, 2, 3]}
				/>
			</label>
		</div>
		<div>
			<label class="label ml-auto">
				<small class="my-auto mr-1 font-black text-lg">Numero de factura</small>
				<input
					type="text"
					bind:value={$form.invoiceNumber}
					class="input {$errors.invoiceNumber ? 'input-error' : ''}"
					aria-invalid={$errors.invoiceNumber ? 'true' : undefined}
				/>
			</label>
		</div>
		<div>
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">
				<small class="my-auto mr-1 font-black text-lg"> Fecha factura</small>
				<InputDate className="input" />
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
				{#each $form.bags as _, i}
					<tr transition:fly={{ x: -350 }}>
						<td>
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<label class="label w-52">
								<Autocomplete
									name="ingredientId-{i}"
									bind:value={$form.bags[i].ingredientId}
									labels={['Zapallo', 'Papa', 'Huevo']}
									values={[1, 2, 3]}
								/>
							</label>
						</td>
						<td>
							<div class="relative inline-block w-24">
								<input class="input" type="text" bind:value={$form.bags[i].fullAmount} />
								<span class="suffix absolute right-3 top-1/4">kg.</span>
							</div>
						</td>
						<td>
							<div class="relative inline-block w-20">
								<input class="input" type="text" bind:value={$form.bags[i].fullAmount} />
							</div>
						</td>
						<td class="w-32">
							<div class="relative inline-block">
								<InputDate className="input w-32"></InputDate>
							</div>
						</td>
						<td>
							<div class="relative inline-block">
								<InputDate className="input w-32"></InputDate>
							</div>
						</td>
						<td class="w-24">
							<div class="relative inline-block">
								<input class="input w-24" type="text" bind:value={$form.bags[i].fullAmount} />
								<span class="suffix absolute right-3 top-1/4">$</span>
							</div>
						</td>

						<td>
							<div class="input-group input-group-divider grid-cols-[auto_auto] w-70">
								<input type="text" bind:value={$form.bags[i].supplier_batch_code} />
								<button type="button" class="variant-filled-surface">Autogenerar</button>
							</div>
						</td>
						<td class="flex align-middle h-full mt-1 mr-1">
							<button
								type="button"
								class="btn-icon btn-icon-sm variant-soft-secondary"
								disabled={$form.bags.length === 1}
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

<br /><br />
<SuperDebug data={$form} />

<style>
</style>
