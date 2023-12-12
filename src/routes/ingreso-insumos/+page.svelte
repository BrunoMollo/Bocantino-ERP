<script lang="ts">
	import Autocomplete from './Autocomplete.svelte';
	import { fly } from 'svelte/transition';
	import { dateProxy, superForm } from 'sveltekit-superforms/client';
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
	import InputDate from '$lib/ui/InputDate.svelte';

	export let data;
	const { EMPTY_BAG } = data;
	const { form, enhance, errors } = superForm(data.form, { dataType: 'json' });
	const proxyDate = dateProxy(form, 'issueDate', { format: 'date' });

	function addLine() {
		form.update((f) => {
			f.bags.push(EMPTY_BAG);
			return f;
		});
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
	<div class="w-11/12 flex mx-auto justify-between mt-10">
		<div class="flex mt-5 w-3/12 justify-between">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">
				<small class="my-auto mr-1 font-black text-lg">Proveedor</small>
				<Autocomplete
					name="supplierId"
					bind:value={$form.supplierId}
					className="input {$errors.supplierId ? 'input-error' : ''}"
					labels={['Juan', 'Pedro', 'Martidsdsadan']}
					values={[1, 2, 3]}
				/>
			</label>
		</div>
		<div class="flex mt-5 px-5 w-4/12 justify-between">
			<label class="label">
				<small class="my-auto mr-1 font-black text-lg">Numero de factura</small>
				<input
					type="text"
					bind:value={$form.invoiceNumber}
					class="input {$errors.invoiceNumber ? 'input-error' : ''}"
					aria-invalid={$errors.invoiceNumber ? 'true' : undefined}
				/>
			</label>
		</div>
		<div class="flex mt-5 pl-16 w-4/12 justify-between">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label">
				<small class="my-auto mr-1 font-black text-lg">Fecha emision factura</small>
				<!-- <InputDate className="input" bind:value={$proxyDate} /> -->
			</label>
		</div>
	</div>
	<div class="table-container w-11/12 mx-auto my-5 shadow-lg rounded-lg" style="">
		<table class="table">
			<thead>
				<tr>
					<th>Materia Prima</th>
					<th>Cantidad</th>
					<th>Codigo</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each $form.bags as _, i}
					<tr transition:fly={{ x: -350 }}>
						<td>
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<label class="label">
								<Autocomplete
									name="ingredientId-{i}"
									bind:value={$form.bags[i].ingredientId}
									labels={['Zapallo', 'Papa', 'Huevo']}
									values={[1, 2, 3]}
								/>
							</label>
						</td>
						<td>
							<div class="relative inline-block">
								<input class="input" type="text" bind:value={$form.bags[i].fullAmount} />
								<span class="suffix absolute right-3 top-1/4">kg.</span>
							</div>
						</td>
						<td>
							<div class="input-group input-group-divider grid-cols-[auto_auto] w-70">
								<input type="text" bind:value={$form.bags[i].supplier_batch_code} />
								<button type="button" class="variant-filled-surface">Autogenerar</button>
							</div>
						</td>
						<td>
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
