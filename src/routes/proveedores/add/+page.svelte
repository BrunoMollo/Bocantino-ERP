<script lang="ts">
	import Spinner from '$lib/ui/Spinner.svelte';
	import { fade } from 'svelte/transition';
	import { createForm } from 'zod-actions';
	import { supplier_schema } from '../supplier_schema';

	export let data;
	export let form;

	const zodAction = createForm(supplier_schema, form);
	const { zodActionEnhance, revalidateInput } = zodAction;
	const { errors, state } = zodAction;
</script>

<article class="card p-4">
	<h2 class="h2">Alta Proveedor</h2>
	<form
		class="flex flex-col gap-4 p-9"
		action=""
		method="post"
		use:zodActionEnhance
		use:revalidateInput
	>
		<label for="name" class="label">
			<span>
				Nombre:
				{#if $errors.name}
					<b class=" text-error-400" transition:fade>{$errors.name}</b>
				{/if}
			</span>
			<input class="input {$errors.name ? 'input-error' : ''}" name="name" type="text" id="name" />
		</label>

		<label for="email" class="label">
			<span>
				Email:
				{#if $errors.name}
					<b class=" text-error-400" transition:fade>{$errors.name}</b>
				{/if}
			</span>
			<input
				class="input {$errors.name ? 'input-error' : ''}"
				name="email"
				type="email"
				id="email"
			/>
		</label>

		<div class="space-y-1">
			<span>Ingredientes que provee:</span>
			{#each data.ingredients as { id, name }, i}
				<label class="flex items-center space-x-2">
					<input class="checkbox" type="checkbox" value={id} name="ingredients[{i}].id" />
					<p>{name}</p>
				</label>
			{/each}
		</div>

		<button type="submit" class="btn variant-filled-primary">
			<b> Crear </b>
			<Spinner showIf={$state.loading} />
		</button>
	</form>
</article>
