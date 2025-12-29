<script lang="ts">
	import { trpc } from '$lib/trpc-client.js';
	import { derivedAsync, startAs } from '$lib/utils.js';
	import { derived, writable } from 'svelte/store';
	import { superForm } from 'sveltekit-superforms/client';
	import IngredientLine from './_components/ingredient-line.svelte';
	import RecipeDiffGraph from './_components/recipie-diff-graph.svelte';
	import Spinner from '$lib/ui/Spinner.svelte';
	import RecipieDiffTable from './_components/recipie-diff-table.svelte';
	import type { NutritionalInfo } from '$lib/nutrients-utils';

	export let data;
	const { ingredients_all } = data;
	const { form, enhance, delayed } = superForm(data.form, {
		taintedMessage: null,
		dataType: 'json',
		onError: ({ result }) => alert(`ERROR: ${result.error.message}`)
	});
	startAs(form, 'produced_amount', null);

	const product_id = derived(form, (x) => x.product_id);
	const recipe = derivedAsync(product_id, async (id) => {
		if (id) {
			return trpc.products.recipe.query(id);
		}
	});

	let modified_recipe = false;
	function restore_recipe() {
		const aux = $form.product_id;
		$form.product_id = 0; // change toa different value to trigger update
		$form.product_id = aux; // trigger update of base_nutritional_info
		modified_recipe = false;
	}
	const base_nutritional_info = derivedAsync(product_id, async (id) => {
		if (id) {
			const res = await trpc.products.nutritional_info.query(id);
			if (res.type == 'LOGIC_ERROR') {
				alert(res.message);
				return undefined;
			}
			return res.data;
		}
	});

	const current_nutritional_info = derivedAsync(recipe, async ($recipe) => {
		if (!$recipe) return undefined;
		if ($recipe == 'WAITING') return undefined;
		if ($recipe == 'ERROR') return undefined;
		const res = await trpc.products.nutritional_info_modified.query($recipe);
		if (res.type == 'LOGIC_ERROR') {
			alert(res.message);
			return undefined;
		}
		return res.data;
	});

	let prev: NutritionalInfo;
	const modified_nutritional_info = derived(current_nutritional_info, (x) => {
		if (x == undefined) return prev;
		if (x == 'WAITING') return prev;
		prev = x;
		return x;
	});

	$: $form.recipe = $recipe as Exclude<typeof $recipe, string | undefined>;
	const insuficient_arr = writable<number[]>([]);
	$: can_send =
		!$form.produced_amount ||
		!($recipe instanceof Object) ||
		!!$insuficient_arr.reduce((a, b) => a + b, 0);

	let dialog: HTMLDialogElement;
	let showTable = true;
	$: msjViewChange = showTable ? 'Mostrar grafico' : 'Mostrar tabla';
</script>

<div class="flex justify-between w-11/12 mx-auto">
	<h1 class="uppercase text-2xl my-5">Orden de produccion de producto final</h1>
	{#if modified_recipe}
		<aside class="mt-3 alert variant-ghost-warning">
			<div class="alert-message">
				<p class="p-0">La receta ha cambiado</p>
			</div>
			<div class="alert-actions">
				<button class="btn variant-soft-warning" on:click={restore_recipe}>Reiniciar</button>
			</div>
		</aside>
	{/if}
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
				step=".01"
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
						on:insuffiecient={(e) => ($insuficient_arr[i] = e.detail)}
					/>
				{/each}
			{/if}
		</tbody>
	</table>

	<div class="pt-4 w-full flex justify-end">
		<button type="submit" class="btn rounded-lg variant-filled-secondary w-1/5" disabled={can_send}>
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
		<button
			type="button"
			class="btn"
			on:click={() => {
				dialog.showModal();
				modified_recipe = true;
			}}>Cambiar Receta</button
		>
	{/if}
</div>

<dialog bind:this={dialog} class="absolute h-screen w-screen bg-transparent">
	<div class="card w-full m-auto mt-14 shadow-lg rounded-lg bg-surface-100-800-token">
		<button class="btn-icon variant-filled m-3 shadow-md" on:click={() => dialog.close()}>
			<i class="bx bx-arrow-back text-2xl"></i>
		</button>
		<div class="w-full flex flex-row">
			<div class="w-4/12">
				<h1 class="text-2xl text-center mb-5">EDITAR RECETA</h1>
				<div class="flex gap-1 justify-around px-5 w-full">
					<h1>Ingrediente:</h1>
					<h1>Cantidad por unidad:</h1>
				</div>
				{#if $recipe && $recipe != 'WAITING' && $recipe != 'ERROR'}
					{#each $recipe as { ingredient_id }, i}
						<div class="flex justify-center gap-1 px-5 mb-3 w-full">
							<select class="select w-7/12" bind:value={ingredient_id}>
								{#each data.ingredients_all as { id, name }}
									<option value={id}>{name} </option>
								{/each}
							</select>
							<input
								class="input w-3/12"
								type="number"
								step="0.01"
								bind:value={$recipe[i].amount}
							/>
						</div>
					{/each}
				{/if}
				<div class="flex justify-center gap-4 mt-5">
					<button class="btn variant-filled-primary rounded" on:click={() => dialog.close()}>
						Aceptar
					</button>
					<button
						class="btn variant-ringed-primary rounded"
						on:click={() => (showTable = !showTable)}>{msjViewChange}</button
					>
				</div>
			</div>

			<div class="h-[700px] p-5 w-8/12">
				{#if $modified_nutritional_info instanceof Object && $base_nutritional_info instanceof Object}
					{#if showTable}
						<RecipieDiffTable modified={$modified_nutritional_info} base={$base_nutritional_info} />
					{:else}
						<RecipeDiffGraph modified={$modified_nutritional_info} base={$base_nutritional_info} />
					{/if}
				{/if}
			</div>
		</div>
	</div>
</dialog>
