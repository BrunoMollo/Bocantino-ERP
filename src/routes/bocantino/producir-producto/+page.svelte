<script lang="ts">
	import { trpc } from '$lib/trpc-client.js';
	import { derivedAsync, startAs } from '$lib/utils.js';
	import { derived } from 'svelte/store';
	import { superForm } from 'sveltekit-superforms/client';
	import IngredientLine from './_compoenets/ingredient-line.svelte';
	import Spinner from '$lib/ui/Spinner.svelte';

	export let data;
	const { ingredients_all } = data;
	const { form, enhance, errors, delayed, message } = superForm(data.form, {
		taintedMessage: null,
		dataType: 'json'
	});
	startAs(form, 'produced_amount', null);

	const product_id = derived(form, (x) => x.product_id);
	const recipe = derivedAsync(product_id, async (id) => {
		if (id) {
			return trpc.products.recipe.query(id);
		}
	});

	$: $form.recipe = $recipe as Exclude<typeof $recipe, string | undefined>;

	function ingredient<T extends keyof (typeof ingredients_all)[0]>(id: number, key: T) {
		return data.ingredients_all.find((x) => x.id == id)?.[key];
	}

	let dialog: HTMLDialogElement;
</script>

<div class="flex justify-between w-11/12 mx-auto">
	<h1 class="uppercase text-2xl my-5">Orden de produccion de prodcuto final</h1>
</div>

<form action="" class="mx-auto w-11/12" use:enhance method="post">
	<div class="flex gap-6 mb-4">
		<select class="select w-4/12" bind:value={$form.product_id}>
			{#each data.products as product}
				<option class="pt-4" value={product.id}>
					{product.desc}
				</option>
			{/each}
		</select>
		<div class="relative inline-block w-70">
			<input
				type="number"
				placeholder="cantidad..."
				bind:value={$form.produced_amount}
				class="input w-full rounded ml-3"
			/>

			<span class="suffix absolute right-3 top-1/4"> Kg </span>
		</div>
	</div>
	<table class="shadow-lg w-full rounded table">
		<thead>
			<tr class="h-10">
				<th class="w-2/12 text-center">Materia prima</th>
				<th class="w-1/12 text-center">Cantidad usada</th>
				<th class="w-1/12 text-center">Cantidad disponible</th>
				<th class="w-4/12 text-center">Lote</th>
				<th class="w-1/12 text-center"></th>
			</tr>
		</thead>
		<tbody>
			{#if !$recipe}
				<tr>
					<td class="text-center w-3/12">
						<p class="text-lg">Elija un producto</p>
					</td>
				</tr>
			{:else if $recipe == 'WAITING'}
				<tr>
					<td class="text-center w-3/12">
						<p class="text-lg">Cargando...</p>
					</td>
				</tr>
			{:else if $recipe == 'ERROR' || !$recipe}
				<tr>
					<td>
						<p class="text-lg">ALGO SALIO MAL</p>
					</td>
				</tr>
			{:else}
				{#each $recipe as line, i}
					<IngredientLine
						{...line}
						{ingredients_all}
						produced_amount={$form.produced_amount}
						bind:value={$form.batches_ids[i]}
					/>
				{/each}
			{/if}
		</tbody>
	</table>

	<div class="pt-4 w-full flex justify-end">
		<button type="submit" class="btn rounded-lg variant-filled-secondary w-1/5">
			{#if $delayed}
				<Spinner showIf={$delayed} size={20} />
			{:else}
				Iniciar produccion
			{/if}
		</button>
	</div>
</form>
<div class="pt-4 pl-10 w-full flex justify-start">
	{#if $recipe instanceof Object}
		<button type="button" class="btn" on:click={() => dialog.showModal()}>Cambiar Receta</button>
	{/if}
</div>

<dialog bind:this={dialog} class="absolute h-screen w-screen bg-transparent text-primary-100">
	<div class="card w-9/12 md:w-2/4 m-auto mt-14 shadow-lg rounded-lg">
		<button
			class="bg-black m-3 p-3 rounded-full h-12 w-12 align-middle shadow-md"
			on:click={() => dialog.close()}
		>
			<i class="bx bx-arrow-back text-2xl"></i>
		</button>
		{#if $recipe && $recipe != 'WAITING' && $recipe != 'ERROR'}
			{#each $recipe as { ingredient_id }, i}
				<select class="select" bind:value={ingredient_id}>
					{#each data.ingredients_all as { id, name }}
						<option value={id}>{name} </option>
					{/each}
				</select>
				<input class="input" type="number" bind:value={$recipe[i].amount} />
			{/each}
		{/if}
		<button class="btn variant-filled-primary" on:click={() => dialog.close()}>Aceptar</button>
	</div>
</dialog>

<!-- TODO:remove -->
<!-- Nutritional info debugging - remove in production -->
<!-- 
<div class="flex flex-row">
	<pre>
		{JSON.stringify(base_nutritional_info || {}, null, 2)}
	</pre>
	<pre>
		{JSON.stringify(current_nutritional_info || {}, null, 2)}
	</pre>
</div>
-->

