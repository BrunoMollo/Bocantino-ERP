<script lang="ts">
	import Spinner from '$lib/ui/Spinner.svelte';
	import { fade } from 'svelte/transition';
	import type { ZodAction } from 'zod-actions';
	import { VALID_UNITS, type ingredient_schema } from './ingredient_schema';

	export let zodAction: ZodAction<typeof ingredient_schema.shape>;

	export let btnMsj = 'Agregar';
	export let value = { name: '', unit: '' };

	const { zodActionEnhance, revalidateInput } = zodAction;
	const { errors, state } = zodAction;
</script>

<form
	class="flex flex-col gap-4 p-9"
	action=""
	method="post"
	use:zodActionEnhance
	use:revalidateInput
>
	<label for="name" class="label">
		<span
			>Nombre:
			{#if $errors.name}
				<b class=" text-error-400" transition:fade>{$errors.name}</b>
			{/if}
		</span>
		<input
			class="input {$errors.name ? 'input-error' : ''}"
			name="name"
			type="text"
			id="name"
			value={value.name}
		/>
	</label>

	<label for="unit" class="label">
		<span>Unidad: </span>
		{#if $errors.unit}
			<b class=" text-error-400" transition:fade>elija una opcion valida</b>
		{/if}
		<select class="select {$errors.unit ? 'input-error' : ''}" name="unit">
			<option disabled selected={value.unit == ''}>---</option>
			{#each VALID_UNITS as unit}
				<option value={unit} selected={value.unit == unit}>{unit}</option>
			{/each}
		</select>
	</label>

	<button class="btn variant-filled-primary" type="submit">
		<b>{btnMsj}</b>
		<Spinner showIf={$state.loading} />
	</button>
</form>
