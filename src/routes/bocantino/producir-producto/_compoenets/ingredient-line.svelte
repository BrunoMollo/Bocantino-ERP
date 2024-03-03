<script lang="ts">
	import { trpc } from '$lib/trpc-client';
	import { createEventDispatcher, onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	export let value = [] as number[];
	export let ingredients_all: { id: number; name: string; unit: string }[];
	export let ingredient_id: number;
	export let produced_amount: number;
	export let amount: number;

	$: ingredient = ingredients_all.find((x) => x.id == ingredient_id);

	let batches = 'WAITING' as Awaited<ReturnType<typeof trpc.ingredient.batches.query>> | 'WAITING';
	$: trpc.ingredient.batches.query(ingredient_id).then((x) => (batches = x));

	$: selected_batches = batches !== 'WAITING' ? batches.filter((x) => value.includes(x.id)) : [];

	$: needed_amount = Number(amount * produced_amount);

	$: current_amount = selected_batches.reduce((acc, item) => acc + item.current_amount, 0);
	$: insuffiecient = !!selected_batches.length && needed_amount > current_amount;
	const dispach = createEventDispatcher();
	onMount(() => {
		dispach('insuffiecient', true); // dispatch whe  created
	});
	$: dispach('insuffiecient', insuffiecient) && current_amount; // the current_amount amoutn is to trigger

	let number_of_barches = 1;
</script>

<tr in:fly={{ x: -100 }}>
	<td class="text-center" style="vertical-align:middle;">
		<p class="text-xl">
			{ingredient?.name}
		</p>
	</td>
	<td class="text-center" style="vertical-align:middle;">
		<p class="text-base">
			{needed_amount.toFixed(2)}
			{selected_batches[0]?.ingredient?.unit ?? ''}
		</p>
	</td>
	<td class="text-center" style="vertical-align:middle;" class:text-error-400={insuffiecient}>
		<p class="text-base">
			{current_amount ?? '-'}
			{selected_batches?.[0]?.ingredient?.unit ?? ''}
		</p>
	</td>
	<td class="text-center" style="vertical-align:middle;">
		{#each Array(number_of_barches) as _, index}
			<select class="select my-1" bind:value={value[index]}>
				{#if batches == 'WAITING'}
					<option disabled>Cargando</option>
				{:else if batches}
					<option disabled selected value="-1">Seleccione un lote</option>
					{#each batches as { id, batch_code, expiration_date }}
						<option value={id}>
							{batch_code}
							{#if expiration_date}
								({new Date(expiration_date).toLocaleDateString('es')})
							{/if}
						</option>
					{/each}
				{:else}
					<option disabled>No se encontraron lotes</option>
				{/if}
			</select>
		{/each}
	</td>
	{#if insuffiecient}
		<td>
			<button
				in:fade={{ delay: 0, duration: 200 }}
				type="button"
				class="btn mx-0 px-2 variant-filled-tertiary rounded-lg"
				on:click={() => number_of_barches++}
			>
				Otro Lote
			</button>
		</td>
	{:else if number_of_barches != 1}
		<td>
			<button
				in:fade={{ delay: 0, duration: 200 }}
				type="button"
				class="btn mx-0 px-2 variant-filled-tertiary rounded-lg"
				on:click={() => {
					if (number_of_barches > 1) {
						number_of_barches--;
						value.pop();
						selected_batches = selected_batches.filter((x) => value.includes(x.id));
					}
				}}
			>
				Quitar Lote
			</button>
		</td>
	{/if}
</tr>

