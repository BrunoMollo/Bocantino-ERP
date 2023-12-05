<script lang="ts">
	import { createForm } from 'zod-actions';
	import type { ActionData } from './$types';
	import { VALID_UNITS, tipoMateriaPrima_schema } from './tipoMateriaPrima_schema';
	import { fade } from 'svelte/transition';

	export let form: ActionData;
	const zodAction = createForm(tipoMateriaPrima_schema, form);
	const { zodActionEnhance, revalidateInput } = zodAction;
	const { errors } = zodAction;
</script>

<main class="container h-full mx-auto flex justify-center items-center">
	<form
		class="card flex flex-col gap-4 p-9"
		action=""
		method="post"
		use:zodActionEnhance
		use:revalidateInput
	>
		<h2 class="h2">Alta Tipo de Materia Prima</h2>
		<label for="name" class="label">
			<span>Nombre:</span>
			{#if $errors.name}
				<b class="text-error-400" transition:fade>{$errors.name}</b>
			{/if}
			<input class="input {$errors.name ? 'input-error' : ''}" name="name" type="text" id="name" />
		</label>

		<label for="unit" class="label">
			<span>Unidad: </span>
			{#if $errors.unit}
				<b class="text-error-400" transition:fade>elija una opcion valida</b>
			{/if}
			<select class="select {$errors.unit ? 'input-error' : ''}" name="unit">
				<option disabled selected>---</option>
				{#each VALID_UNITS as unit}
					<option value={unit}>{unit}</option>
				{/each}
			</select>
		</label>

		<button class="btn variant-filled-primary" type="submit">Agregar</button>
	</form>
</main>
