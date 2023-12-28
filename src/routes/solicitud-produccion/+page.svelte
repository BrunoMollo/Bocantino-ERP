<script lang="ts">
	import { page } from '$app/stores';
	import Autocomplete from '$lib/ui/Autocomplete.svelte';
	import { makeOptions } from '$lib/utils';
	import { derived } from 'svelte/store';
	import { fly } from 'svelte/transition';
	import { superForm } from 'sveltekit-superforms/client';
	export let data;
	const { form, enhance, errors, delayed } = superForm(data.form, {
		dataType: 'json',
		clearOnSubmit: 'none'
	});

	const recipePromise = derived(
		derived(form, ({ ingredeintId }) => ingredeintId),
		(ingredeintId) => {
			if (ingredeintId) {
				return fetch($page.url + '/recipe/' + ingredeintId).then((x) => x.json());
			}
			return null;
		}
	);

	const optionsIngredientsTypes = makeOptions(data.ingredients, { value: 'id', label: 'name' });
	let fecha = '19/11/2022';
	let numero = 12;
</script>

<div class="flex justify-between w-11/12 mx-auto">
	<h1 class="uppercase text-2xl my-5">Solicitud de produccion N:{numero}</h1>
	<h2 class="uppercase text-2xl my-5">Fecha: {fecha}</h2>
</div>

<form action="" class="mx-auto w-11/12" use:enhance>
	<div class="flex gap-6 mb-4">
		<Autocomplete
			className="w-3/12"
			name="IngredientsTypes"
			bind:value={$form.ingredeintId}
			{...optionsIngredientsTypes}
		/>
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
				<th class="w-3/12 text-center">Materia prima</th>
				<th class="w-3/12 text-center">Lote</th>
				<th class="w-2/12 text-center">Cantidad disponible</th>
				<th class="w-2/12 text-center">Cantidad</th>
				<th class="w-2/12 text-center"></th>
			</tr>
		</thead>
		<tbody>
			{#if !$recipePromise}
				<tr>
					<td class="text-center w-3/12">Elija un producto</td>
				</tr>
			{:else}
				{#await $recipePromise}
					<tr>
						<td class="text-center w-3/12">Cargando...</td>
					</tr>
				{:then recipe}
					<tr transition:fly={{ x: -100 }}>
						<td class="text-center w-3/12">{recipe.source.name}</td>
						<td class="text-center w-3/12">??? </td>
						<td class="text-center w-2/12">??? </td>
						<td class="text-center w-2/12"> {(recipe.amount * $form.producedAmount).toFixed(3)}</td>
						<td class="text-center w-2/12"> <button class="btn">Agregar Lote</button></td>
					</tr>
				{/await}
			{/if}
		</tbody>
	</table>
</form>

