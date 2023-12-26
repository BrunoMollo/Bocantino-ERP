<script lang="ts">
	import { page } from '$app/stores';
	import Autocomplete from '$lib/ui/Autocomplete.svelte';
	import { makeOptions } from '$lib/utils';
	import { derived } from 'svelte/store';
	import { fade, fly, slide } from 'svelte/transition';
	import { superForm } from 'sveltekit-superforms/client';
	export let data;
	const { form, enhance, errors, delayed } = superForm(data.form, {
		dataType: 'json',
		clearOnSubmit: 'none'
	});

	let filas = [
		{
			materiaPrima: 'Materia prima 1',
			faltante: 200,
			lotes: [
				{ identificador: 'A807BC', cantidadDisponible: 700, cantidad: 320 },
				{ identificador: 'A8AABC', cantidadDisponible: 200, cantidad: 120 }
			]
		},
		{
			materiaPrima: 'Materia prima 2',
			faltante: 200,
			lotes: [
				{ identificador: 'A807BC', cantidadDisponible: 700, cantidad: 320 },
				{ identificador: 'A8AABC', cantidadDisponible: 200, cantidad: 120 }
			]
		},
		{
			materiaPrima: 'Materia prima 2',
			faltante: 200,
			lotes: [
				{ identificador: 'A807BC', cantidadDisponible: 700, cantidad: 320 },
				{ identificador: 'A8AABC', cantidadDisponible: 200, cantidad: 120 }
			]
		},
		{
			materiaPrima: 'Materia prima 2',
			faltante: 200,
			lotes: [
				{ identificador: 'A807BC', cantidadDisponible: 700, cantidad: 320 },
				{ identificador: 'A8AABC', cantidadDisponible: 200, cantidad: 120 }
			]
		}
	];

	const recipePromise = derived(form, ({ ingredeintId, producedAmount }) => {
		if (ingredeintId && producedAmount) {
			return fetch($page.url + '/recipe/' + ingredeintId).then((x) => x.json());
		}
		return null;
	});
	$: console.log($recipePromise);

	const optionsIngredientsTypes = makeOptions(data.ingredients, { value: 'id', label: 'name' });
	let fecha = '19/11/2022';
	let numero = 12;
</script>

<div class="flex justify-between w-11/12 mx-auto">
	<h1 class="uppercase text-2xl my-5">Solicitud de produccion N:{numero}</h1>
	<h2 class="uppercase text-2xl my-5">Fecha: {fecha}</h2>
</div>

<form action="" class="mx-auto w-11/12">
	<div class="flex gap-6 mb-4">
		<Autocomplete
			className="w-3/12"
			name="IngredientsTypes"
			bind:value={$form.ingredeintId}
			{...optionsIngredientsTypes}
		/>
		<div class="flex">
			<h1 class="text-nowrap my-auto">Ingrese la cantidad a producir:</h1>
			<input
				type="text"
				placeholder="cantidad..."
				bind:value={$form.producedAmount}
				class="input w-1/3 rounded ml-3"
			/>
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
						<td class="text-center w-2/12"> </td>
						<td class="text-center w-2/12">
							{recipe.amount * $form.producedAmount}<button class="btn">Agregar Lote</button></td
						>
					</tr>
				{/await}
			{/if}
		</tbody>
	</table>
</form>

