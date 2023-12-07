<script lang="ts">
	import Spinner from '$lib/ui/Spinner.svelte';
	import { fade } from 'svelte/transition';
	import { createForm, createSlots } from 'zod-actions';
	import type { ActionData, PageData } from './$types';
	import { product_schema } from '../product_schema.js';

	export let data: PageData;
	export let form: ActionData;

	const zodAction = createForm(product_schema, form);
	const { zodActionEnhance, revalidateInput } = zodAction;
	const { errors, state } = zodAction;
	const ingredientsSlots = createSlots(1, 300);
</script>

<article class="card p-4">
	<h2 class="h2">Alta Productos</h2>
	<form
		class="flex flex-col gap-4 p-9"
		action=""
		method="post"
		use:zodActionEnhance
		use:revalidateInput
	>
		<label for="name" class="label">
			<span>
				Descripcion:
				{#if $errors.desc}
					<b class=" text-error-400" transition:fade>{$errors.desc}</b>
				{/if}
			</span>
			<input class="input {$errors.desc ? 'input-error' : ''}" name="desc" type="text" id="name" />
		</label>

		<div class=" grid grid-cols-2 gap-3">
			<span>Ingrediente</span>
			<span>Cantidad</span>
			{#each $ingredientsSlots as i}
				<label class="label">
					{#if $errors.ingredients?.at(i, 'id')}
						<b class=" text-error-400" transition:fade>Requerido</b>
					{/if}
					<select name="ingredients[{i}].id" class="select">
						<option selected disabled>---</option>
						{#each data.materiasPrimas as { id, name, unit }}
							<option value={id}>{name} ({unit})</option>
						{/each}
					</select>
				</label>
				<label class="label">
					{#if $errors.ingredients?.at(i, 'amount')}
						<b class=" text-error-400" transition:fade>{$errors.ingredients.at(i, 'amount')}</b>
					{/if}
					<input class="input" type="number" name="ingredients[{i}].amount" />
				</label>
			{/each}
		</div>
		<div class="grid grid-cols-2 gap-20 px-10">
			<button type="button" class="btn variant-filled-primary" on:click={ingredientsSlots.add}>
				Otro ingrediente
			</button>

			<button type="button" class="btn variant-filled-primary" on:click={ingredientsSlots.remove}>
				Quitar ingrediente
			</button>
		</div>

		<button type="submit" class="btn variant-filled-primary">
			<b> Crear </b>
			<Spinner showIf={ $state.loading} />
		</button>
	</form>
</article>
