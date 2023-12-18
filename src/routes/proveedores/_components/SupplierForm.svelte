<script lang="ts">
	import Spinner from '$lib/ui/Spinner.svelte';
	import { fade } from 'svelte/transition';
	import { superForm } from 'sveltekit-superforms/client';
	import type { SupplierSchema } from './shared';

	export let data: { form: any };
	export let ingridientsAvailables: { id: number; name: string }[];
	const { form, enhance, errors, delayed } = superForm<SupplierSchema>(data.form, {
		dataType: 'json',
		clearOnSubmit: 'none'
	});

	export let btnMsj = 'Agregar';
</script>

<form class="flex flex-col gap-4 p-9" action="" method="post" use:enhance>
	<label for="name" class="label">
		<span>
			Nombre:
			{#if $errors.name}
				<b class=" text-error-400" transition:fade>{$errors.name}</b>
			{/if}
		</span>
		<input
			class="input {$errors.name ? 'input-error' : ''}"
			name="name"
			type="text"
			id="name"
			bind:value={$form.name}
		/>
	</label>

	<label for="email" class="label">
		<span>
			Email:
			{#if $errors.email}
				<b class=" text-error-400" transition:fade>{$errors.email}</b>
			{/if}
		</span>
		<input class="input {$errors.email ? 'input-error' : ''}" bind:value={$form.email} />
	</label>

	<div class="space-y-1">
		<span>Ingredientes que provee:</span>

		{#each ingridientsAvailables as { id, name }}
			<label class="flex items-center space-x-2">
				<input class="checkbox" type="checkbox" value={id} bind:group={$form.ingredientsIds} />
				<p>{name}</p>
			</label>
		{/each}
	</div>

	<button class="btn variant-filled-primary" type="submit">
		<b>{btnMsj}</b>
		<Spinner showIf={$delayed} />
	</button>
</form>

