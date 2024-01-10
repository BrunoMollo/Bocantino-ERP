<script lang="ts">
	import { trpc } from '$lib/trpc-client';
	import { startAs } from '$lib/utils.js';
	import { derived, writable } from 'svelte/store';
	import { fade, fly } from 'svelte/transition';
	import { superForm } from 'sveltekit-superforms/client';
	import Spinner from '$lib/ui/Spinner.svelte';

	export let data;
	const { form, enhance, delayed } = superForm(data.form, {
		dataType: 'json',
		clearOnSubmit: 'none',
		onError: ({ result }) => alert(`ERROR: ${result.error.message}`)
	});

	startAs(form, 'producedAmount', null);

	derived(form, ({ ingredeintId }) => ingredeintId).subscribe((ingredeintId) => {
		if (ingredeintId) {
			recipe.set('WAITING');
			trpc.ingredient.recipe.query(ingredeintId).then(recipe.set);
		}
	});

	type Recipe = Awaited<ReturnType<typeof trpc.ingredient.recipe.query>>;
	const recipe = writable<Recipe | 'WAITING'>(undefined);

	type Batches = Awaited<ReturnType<typeof trpc.ingredient.batches.query>>;
	const batches = writable<Batches | 'WAITING'>(undefined);
	recipe.subscribe(($recipe) => {
		if ($recipe instanceof Object) {
			batches.set('WAITING');
			trpc.ingredient.batches.query($recipe.source.id).then(batches.set);
		}
	});

	const selected_batch = derived(
		[batches, derived(form, ({ selected_batch_id }) => selected_batch_id)],
		([$batch, selected_batch_id]) => {
			if ($batch instanceof Object) {
				return $batch.find((x) => x.id === selected_batch_id);
			}
		}
	);

	const selected_batch_second = derived(
		[batches, derived(form, ({ second_selected_batch_id }) => second_selected_batch_id)],
		([$batch, second_selected_batch_id]) => {
			if ($batch instanceof Object) {
				return $batch.find((x) => x.id === second_selected_batch_id);
			}
		}
	);

	const amount_needed = derived(
		[recipe, derived(form, ({ producedAmount }) => producedAmount)],
		([$recipe, $producedAmount]) => {
			if ($recipe instanceof Object) {
				return $recipe.amount * $producedAmount;
			}
		}
	);

	const available_amount = derived(
		[
			batches,
			derived(form, ({ selected_batch_id, second_selected_batch_id }) => [
				selected_batch_id,
				second_selected_batch_id
			])
		],
		([$batches, $ids]) => {
			let total = 0;
			if (!($batches instanceof Object)) return total;
			for (let id of $ids) {
				const batch = $batches.find((x) => x.id == id);
				total += batch?.current_amount ?? 0;
			}
			return total;
		}
	);

	const surpass_amount = derived(
		[amount_needed, selected_batch, selected_batch_second],
		([$amount_needed, $selected_batch, $selected_batch_second]) => {
			if ($selected_batch) {
				const total =
					$selected_batch.current_amount + ($selected_batch_second?.current_amount ?? 0);
				return total < ($amount_needed ?? 0);
			}
			return false;
		}
	);

	let needs_two_batches = false;

	const fecha = new Date().toLocaleDateString('es');

	const numero = 12;
</script>

<div class="flex justify-between w-11/12 mx-auto">
	<h1 class="uppercase text-2xl my-5">Solicitud de produccion N:{numero}</h1>
	<h2 class="uppercase text-2xl my-5">Fecha: {fecha}</h2>
</div>

<form action="" class="mx-auto w-11/12" use:enhance method="post">
	<div class="flex gap-6 mb-4">
		<select class="select w-4/12" bind:value={$form.ingredeintId}>
			{#each data.ingredients as ingredient}
				<option class="pt-4" value={ingredient.id}>
					{ingredient.name}
				</option>
			{/each}
		</select>
		<div class="relative inline-block w-70">
			<input
				type="number"
				placeholder="cantidad..."
				bind:value={$form.producedAmount}
				class="input w-full rounded ml-3"
			/>
			<span class="suffix absolute right-3 top-1/4">
				{data.ingredients.find((x) => x.id == $form.ingredeintId)?.unit ?? ''}
			</span>
		</div>
	</div>
	<table class="shadow-lg w-full rounded table">
		<thead>
			<tr class="h-10">
				<th class="w-2/12 text-center">Materia prima</th>
				<th class="w-1/12 text-center">Cantidad usada</th>
				<th class="w-1/12 text-center">Cantidad disponible</th>
				<th class="w-4/12 text-center">Lote</th>
				<th class="w-1/12 text-center"></th>
			</tr>
		</thead>
		<tbody>
			{#if !$recipe}
				<tr>
					<td class="text-center w-3/12">
						<p class="text-lg">Elija un producto</p>
					</td>
				</tr>
			{:else if $recipe == 'WAITING'}
				<tr>
					<td class="text-center w-3/12">
						<p class="text-lg">Cargando...</p>
					</td>
				</tr>
			{:else if $recipe == 'ERROR' || !$recipe}
				<tr>
					<td>
						<p class="text-lg">ALGO SALIO MAL</p>
					</td>
				</tr>
			{:else}
				<tr in:fly={{ x: -100 }}>
					<td class="text-center" style="vertical-align:middle;">
						<p class="text-xl">
							{$recipe.source.name}
						</p>
					</td>
					<td class="text-center" style="vertical-align:middle;">
						<p class="text-base">
							{$amount_needed?.toFixed(2)}
						</p>
					</td>
					<td
						class="text-center"
						style="vertical-align:middle;"
						class:text-error-400={$surpass_amount}
					>
						<p class="text-base">
							{$available_amount.toFixed(2)}
						</p>
					</td>
					<td class="text-center" style="vertical-align:middle;">
						<select class="select" bind:value={$form.selected_batch_id}>
							{#if $batches == 'WAITING'}
								<option disabled>Cargando</option>
							{:else if $batches}
								<option disabled selected>Seleccione un lote</option>
								{#each $batches as { id, batch_code, expiration_date }}
									{#if id != $form.second_selected_batch_id}
										<option value={id}>
											{batch_code}
											{#if expiration_date}
												({new Date(expiration_date).toLocaleDateString('es')})
											{/if}
										</option>
									{/if}
								{/each}
							{:else}
								<option disabled>No se encontraron lotes</option>
							{/if}
						</select>

						{#if needs_two_batches}
							<select
								transition:fade={{ duration: 200 }}
								class="select mt-4"
								bind:value={$form.second_selected_batch_id}
							>
								{#if $batches == 'WAITING'}
									<option disabled>Cargando</option>
								{:else if $batches}
									<option disabled selected>Seleccione un lote</option>
									{#each $batches as { id, batch_code, expiration_date }}
										{#if id != $form.selected_batch_id}
											<option value={id}>
												{batch_code}
												{#if expiration_date}
													({new Date(expiration_date).toLocaleDateString('es')})
												{/if}
											</option>
										{/if}
									{/each}
								{:else}
									<option disabled>No se encontraron lotes</option>
								{/if}
							</select>
						{/if}
					</td>
					{#if $surpass_amount && !needs_two_batches}
						<td>
							<button
								in:fade={{ delay: 0, duration: 200 }}
								type="button"
								class="btn mx-0 px-2 variant-filled-tertiary rounded-lg"
								on:click={() => (needs_two_batches = true)}
							>
								Otro Lote
							</button>
						</td>
					{:else if needs_two_batches}
						<td>
							<button
								in:fade={{ delay: 0, duration: 200 }}
								type="button"
								class="btn mx-0 px-2 variant-filled-tertiary rounded-lg"
								on:click={() => {
									needs_two_batches = false;
									$form.second_selected_batch_id = null;
								}}
							>
								Quitar Lote
							</button>
						</td>
					{/if}
				</tr>
			{/if}
		</tbody>
	</table>

	<div class="pt-4 w-full flex justify-end">
		<button
			type="submit"
			class="btn rounded-lg variant-filled-secondary w-1/5"
			disabled={$surpass_amount || !$form.selected_batch_id || $form.producedAmount <= 0}
		>
			{#if $delayed}
				<Spinner showIf={$delayed} size={20} />
			{:else}
				Iniciar produccion
			{/if}
		</button>
	</div>
</form>

