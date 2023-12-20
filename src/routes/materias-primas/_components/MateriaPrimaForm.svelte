<script lang="ts">
	import Spinner from '$lib/ui/Spinner.svelte';
	import { fade } from 'svelte/transition';
	import { superForm } from 'sveltekit-superforms/client';
	import { VALID_UNITS, type IngredientSchema } from './shared';
	export let ingredients: { id: number; name: string; unit: string }[];

	export let data: { form: any };
	const { form, enhance, errors, delayed } = superForm<IngredientSchema>(data.form);
	let activo: boolean = false;
	function cambiarActivo() {
		activo = !activo;
	}

	export let btnMsj = 'Agregar';
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
		class={`input ${$errors.unit ? 'input-error' : ''} w-5/6`}
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

	<label>
		<input class="checkbox" type="checkbox" id="myCheckbox" on:input={cambiarActivo} /> Producto interno
	</label>

	<label for="unit" class="label" style={`display: ${activo ? '' : 'none'}`}>
		<span>Seleccione de que materia prima deriva: </span>
		{#if $errors.derivedId}
			<b class=" text-error-400" transition:fade>elija una opcion valida</b>
		{/if}

		<select
			class={`select ${$errors.derivedId ? 'input-error' : ''} w-4/5`}
			name="derivedId"
			bind:value={$form.derivedId}
		>
			<option disabled selected={!$form.derivedId}>---</option>
			{#each ingredients as ingredient}
				<option value={ingredient.id} selected={$form.derivedId == ingredient.id}
					>{ingredient.name} ({ingredient.unit})</option
				>
			{/each}
		</select>
	</label>
	<label for="unit" class="label" style={`display: ${activo ? '' : 'none'}`}>
		Ingrese la cantidad para producir un {$form.unit} de {$form.name}

		{#if $errors.amount}
			<b class=" text-error-400" transition:fade>Ingrese un valor valido</b>
		{/if}
	</label>

	<input
		style={`display: ${activo ? '' : 'none'}; margin-top:-10px`}
		class={`input ${$errors.amount ? 'input-error' : ''} w-1/3`}
		name="amount"
		type="number"
		id="amount"
		bind:value={$form.amount}
	/>

	<label for="puntoPedido" class="label">
		<span
			>Punto de pedido:
			{#if $errors.reorderPoint}
				<b class=" text-error-400" transition:fade>{$errors.reorderPoint}</b>
			{/if}
		</span>
	</label>
	<input
		style="margin-top: -10px"
		class={`input ${$errors.unit ? 'input-error' : ''} w-1/3`}
		name="reorderPoint"
		type="number"
		id="reorderPoint"
		bind:value={$form.reorderPoint}
	/>

	<button class="btn variant-filled-primary" type="submit">
		<b>{btnMsj}</b>
		<Spinner showIf={$delayed} />
	</button>
</form>
