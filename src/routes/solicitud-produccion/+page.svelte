<script lang="ts">
	import { trpcClient } from '$trpc/browserClients.js';
	import { derived, writable } from 'svelte/store';
	import { fly } from 'svelte/transition';
	import { superForm } from 'sveltekit-superforms/client';

	export let data;
	const { form, enhance, errors, delayed } = superForm(data.form, {
		dataType: 'json',
		clearOnSubmit: 'none'
	});

	derived(form, ({ ingredeintId }) => ingredeintId).subscribe((ingredeintId) => {
		if (ingredeintId) {
			recipe.set('WAITING');
			trpcClient.ingredient.recipe.query(ingredeintId).then(recipe.set);
		}
	});

	type Recipe = Awaited<ReturnType<typeof trpcClient.ingredient.recipe.query>>;
	const recipe = writable<Recipe | 'WAITING'>(undefined);

	type Batches = Awaited<ReturnType<typeof trpcClient.ingredient.batches.query>>;
	const batches = writable<Batches | 'WAITING'>(undefined);
	recipe.subscribe(($recipe) => {
		if ($recipe instanceof Object) {
			trpcClient.ingredient.batches.query($recipe.source.id).then(batches.set);
		}
	});


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
				type="text"
				placeholder="cantidad..."
				bind:value={$form.producedAmount}
				class="input w-full rounded ml-3"
			/>
			<span class="suffix absolute right-3 top-1/4"
				>{data.ingredients.find((x) => x.id == $form.ingredeintId)?.unit ?? ''}</span
			>
		</div>
	</div>
	<table class="shadow-lg w-full rounded table">
		<thead>
			<tr class="h-10">
				<th class="w-2/12 text-center">Materia prima</th>
				<th class="w-1/12 text-center">Cantidad</th>
				<th class="w-1/12 text-center">Cantidad disponible</th>
				<th class="w-4/12 text-center">Lote</th>
			</tr>
		</thead>
		<tbody>
			{#if !$recipe}
				<tr>
					<td class="text-center w-3/12">Elija un producto</td>
				</tr>
			{:else if $recipe == 'WAITING'}
				<tr>
					<td class="text-center w-3/12">Cargando...</td>
				</tr>
			{:else if $recipe == 'ERROR' || !$recipe}
				<tr>
					<td> ALGO SALIO MAL</td>
				</tr>
			{:else}
				<tr in:fly={{ x: -100 }}>
					<td class="text-center w-2/12">{$recipe.source.name}</td>
					<td class="text-center w-1/12">
						{($recipe.amount * $form.producedAmount).toFixed(3)}
					</td>
					<td class="text-center w-1/12"> ?? </td>
					<td class="text-center w-4/12">
						<select class="select">
							{#if $batches == 'WAITING'}
								<option disabled>Cargando</option>
							{:else if $batches}
								{#each $batches as { id, batch_code, expirationDate }}
									<option value={id}>
										{batch_code}
										({new Date(expirationDate).toLocaleDateString('es')})
									</option>
								{/each}
							{:else}
								<option disabled>No se encontraron lotes</option>
							{/if}
						</select>
					</td>
				</tr>
			{/if}
		</tbody>
	</table>

	<div class="pt-4 w-full flex justify-end">
		<button type="submit" class="btn rounded-lg variant-filled-secondary w-1/5">
			Iniciar produccion
		</button>
	</div>
</form>

