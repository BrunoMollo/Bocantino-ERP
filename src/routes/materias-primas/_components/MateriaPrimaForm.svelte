<script lang="ts">
	import Spinner from '$lib/ui/Spinner.svelte';
	import { fade } from 'svelte/transition';
	import { superForm } from 'sveltekit-superforms/client';
	import { VALID_UNITS, type IngredientSchema } from './shared';

	export let data: { form: any };
	const { form, enhance, errors, delayed } = superForm<IngredientSchema>(data.form);

	export let btnMsj = 'Agregar';
</script>

<form class="flex flex-col gap-4 p-9" action="" method="post" use:enhance>
	<label for="name" class="label">
		<span
			>Nombre:
			{#if $errors.name}
				<b class=" text-error-400" transition:fade>{$errors.name}</b>
			{/if}
		</span>
		<input
			class={`input ${$errors.unit ? 'input-error' : ''}`}
			name="name"
			type="text"
			id="name"
			bind:value={$form.name}
		/>
	</label>

	<label for="unit" class="label">
		<span>Unidad: </span>
		{#if $errors.unit}
			<b class=" text-error-400" transition:fade>elija una opcion valida</b>
		{/if}
		<select
			class={`select ${$errors.unit ? 'input-error' : ''}`}
			name="unit"
			bind:value={$form.unit}
		>
			<option disabled selected={!$form.unit}>---</option>
			{#each VALID_UNITS as unit}
				<option value={unit} selected={$form.unit == unit}>{unit}</option>
			{/each}
		</select>
	</label>

	<button class="btn variant-filled-primary" type="submit">
		<b>{btnMsj}</b>
		<Spinner showIf={$delayed} />
	</button>
</form>
