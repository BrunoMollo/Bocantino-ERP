<script lang="ts">
	import Spinner from '$lib/ui/Spinner.svelte';
	import { fade } from 'svelte/transition';
	import { superForm } from 'sveltekit-superforms/client';
	import type { ProductSchema } from './zodSchema';
	import { startAs } from '$lib/utils';

	export let product:
		| { desc: string; ingredients: Array<{ ingredient_id: number; amount: number }> }
		| undefined = undefined;

	export let data: { form: any };
	const { form, enhance, errors, delayed } = superForm<ProductSchema>(data.form, {
		dataType: 'json',
		taintedMessage: null,
		onError: ({ result }) => {
			alert('algo salio mal, llamar a soporte \n msj: ' + result.error.message);
		}
	});

	export let availableIngredients: { id: number; name: string; unit: string }[];
	export let btnMsj = 'Agregar';

	function addLine() {
		form.update((f) => {
			//@ts-ignore
			f.ingredients.push({});
			return f;
		});
	}

	function removeLine(index: number) {
		form.update((f) => {
			if (f.ingredients.length > 1) {
				//@ts-ignore
				f.ingredients = f.ingredients.filter((_, i) => i !== index);
			}
			return f;
		});
	}

	if (product) {
		startAs(form, 'desc', product.desc);
		startAs(form, 'ingredients', product.ingredients);
	} else {
		addLine();
	}

	function ingredientError(index: number, field: keyof (typeof $form.ingredients)[0]) {
		if ($errors.ingredients) {
			return $errors.ingredients[index][field];
		}
	}
</script>

<form class="flex flex-col gap-4 p-9" action="" method="post" use:enhance>
	<label for="desc" class="label">
		<span>
			Descripcion:
			{#if $errors.desc}
				<b class=" text-error-400" transition:fade>{$errors.desc}</b>
			{/if}
		</span>
		<input
			class="input"
			class:input-error={$errors.desc}
			type="text"
			id="desc"
			bind:value={$form.desc}
		/>
	</label>

	<div class=" grid grid-cols-3 gap-3">
		<span>Ingrediente</span>
		<span>Cantidad</span>
		<span></span>
		{#each $form.ingredients as _, i}
			<label class="label">
				<select
					class="select"
					class:input-error={ingredientError(i, 'ingredient_id')}
					bind:value={$form.ingredients[i].ingredient_id}
				>
					<option selected disabled>---</option>
					{#each availableIngredients as { id, name, unit }}
						<option value={id}>{name} ({unit})</option>
					{/each}
				</select>
			</label>
			<label class="label">
				<input
					class="input"
					class:input-error={ingredientError(i, 'amount')}
					type="number"
					bind:value={$form.ingredients[i].amount}
				/>
			</label>
			<button type="button" class="btn variant-filled-primary" on:click={() => removeLine(i)}>
				Quitar
			</button>
		{/each}
	</div>
	<div class="grid grid-cols-2 gap-20 px-10">
		<button type="button" class="btn variant-filled-primary" on:click={addLine}>
			Otro ingrediente
		</button>
	</div>

	<button type="submit" class="btn variant-filled-primary">
		<b> {btnMsj} </b>
		<Spinner showIf={$delayed} size={4} />
	</button>
</form>

