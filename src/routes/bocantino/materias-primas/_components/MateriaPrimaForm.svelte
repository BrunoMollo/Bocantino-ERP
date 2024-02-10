<script lang="ts">
	import Spinner from '$lib/ui/Spinner.svelte';
	import { fade } from 'svelte/transition';
	import { superForm } from 'sveltekit-superforms/client';
	import { VALID_UNITS, type IngredientSchema } from './shared';
	import { should_not_reach, startAs } from '$lib/utils';

	export let ingredients: { id: number; name: string; unit: string }[];

	export let data: { form: any };
	const { form, enhance, errors, delayed } = superForm<IngredientSchema>(data.form, {
		onError: ({ result }) => alert(`ERROR: ${result.error.message}`),
		dataType: 'json',
		taintedMessage: null
	});
	function toggleIsDerived() {
		if ($form.source == null) {
			//@ts-ignore
			$form.source = {};
		} else {
			$form.source = null;
		}
	}

	// if it does not come from backend
	if ($form.name === '') {
		startAs(form, 'reorder_point', null);
		startAs(form, 'nutrient_carb', null);
		startAs(form, 'nutrient_protein', null);
		startAs(form, 'nutrient_fat', null);
	}
	export let btnMsj = 'Agregar';

	const nutrients = ['nutrient_protein', 'nutrient_fat', 'nutrient_carb'] as const;
	function name_nutrient(name: (typeof nutrients)[number]) {
		switch (name) {
			case 'nutrient_protein':
				return 'Proteina';
			case 'nutrient_fat':
				return 'Grasas';
			case 'nutrient_carb':
				return 'Carbohidratos';
			default:
				should_not_reach(name);
		}
	}
</script>

<form class="flex flex-col gap-4 p-9 w-full" action="" method="post" use:enhance>
	<label for="name" class="label">
		<span
			>Nombre:
			{#if $errors.name}
				<b class=" text-error-400" transition:fade>{$errors.name}</b>
			{/if}
		</span>
	</label>
	<input
		style="margin-top:-10px"
		placeholder="nombre del nuevo ingrediente"
		class={`input ${$errors.name ? 'input-error' : ''} w-5/6`}
		name="name"
		type="text"
		id="name"
		bind:value={$form.name}
	/>

	<label for="unit" class="label">
		<span>Unidad: </span>
		{#if $errors.unit}
			<b class=" text-error-400" transition:fade>elija una opcion valida</b>
		{/if}
	</label>
	<select
		style="margin-top: -10px"
		class={`select ${$errors.unit ? 'input-error' : ''} w-1/2`}
		name="unit"
		bind:value={$form.unit}
	>
		<option disabled selected={!$form.unit}>---</option>
		{#each VALID_UNITS as unit}
			<option value={unit} selected={$form.unit == unit}>{unit}</option>
		{/each}
	</select>

	<label for="puntoPedido" class="label">
		<span>
			Punto de pedido:
			{#if $errors.reorder_point}
				<b class=" text-error-400" transition:fade>{$errors.reorder_point}</b>
			{/if}
		</span>
	</label>
	<input
		placeholder="Punto de pedido"
		style="margin-top: -10px"
		class={`input ${$errors.unit ? 'input-error' : ''} w-1/3`}
		name="reorder_point"
		type="number"
		id="reorder_point"
		bind:value={$form.reorder_point}
	/>

	<label>
		<input class="checkbox" type="checkbox" checked={!!$form.source} on:input={toggleIsDerived} />
		<span>Producto derivado</span>
	</label>
	{#if $form.source}
		<label for="unit" class="label" transition:fade>
			<span>Seleccione de que materia prima deriva: </span>
			{#if $errors.source?.id}
				<b class=" text-error-400">elija una opcion valida</b>
			{/if}
		</label>

		<select
			transition:fade
			class={`select ${$errors.source?.id ? 'input-error' : ''} w-4/5`}
			name="derived_id"
			bind:value={$form.source.id}
		>
			<option disabled selected={!$form.source.id}>---</option>
			{#each ingredients as ingredient}
				<option value={ingredient.id} selected={$form.source.id == ingredient.id}>
					{ingredient.name} ({ingredient.unit})
				</option>
			{/each}
		</select>
		<label for="unit" class="label" transition:fade>
			Ingrese la cantidad para producir un {$form.unit} de {$form.name}

			{#if $errors.source?.amount}
				<b class=" text-error-400" transition:fade>Ingrese un valor valido</b>
			{/if}
		</label>

		<input
			transition:fade
			placeholder="cantidad necesaria"
			class={`input ${$errors.source?.amount ? 'input-error' : ''} w-1/3`}
			name="amount"
			id="amount"
			bind:value={$form.source.amount}
		/>
	{/if}

	{#each nutrients as n}
		<div class="">
			<label class="label" transition:fade for={n}>
				<span>{name_nutrient(n)}</span>
				{#if $errors[n]}
					<b class=" text-error-400" transition:fade>Ingrese un valor valido</b>
				{/if}
			</label>
			<div class="relative inline-block w-36">
				<input
					type="number"
					transition:fade
					placeholder="cantidad"
					class={`input ${$errors[n] ? 'input-error' : ''}`}
					name={n}
					bind:value={$form[n]}
				/>
				<!-- TODO: if the ingrediet is in grams, how do we mesure its porporsion gr/gr???? surely not-->
				<span class="suffix absolute right-3 bottom-[20%] pt-0">gr/{$form.unit}</span>
			</div>
		</div>
	{/each}

	<button class="btn variant-filled-primary" type="submit">
		<b>{btnMsj}</b>
		<Spinner showIf={$delayed} size={4} />
	</button>
</form>

