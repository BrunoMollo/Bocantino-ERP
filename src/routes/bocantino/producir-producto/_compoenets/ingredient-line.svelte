<script lang="ts">
	import { fly } from 'svelte/transition';

	export let ingredients_all: { id: number; name: string; unit: string }[];
	export let ingredient_id: number;
	export let amount: number;

	$: ingredient = ingredients_all.find((x) => x.id == ingredient_id);
</script>

<tr in:fly={{ x: -100 }}>
	<td class="text-center" style="vertical-align:middle;">
		<p class="text-xl">
			{ingredient?.name}
		</p>
	</td>
	<td class="text-center" style="vertical-align:middle;">
		<p class="text-base">
			{Number(amount).toFixed(2)}
		</p>
	</td>
	<td class="text-center" style="vertical-align:middle;" class:text-error-400={false}>
		<p class="text-base">
			???
			<!-- {$available_amount.toFixed(2)} -->
		</p>
	</td>
	<td class="text-center" style="vertical-align:middle;">
		<!-- <select class="select" bind:value={$form.selected_batch_id}> -->
		<!-- 	{#if $batches == 'WAITING'} -->
		<!-- 		<option disabled>Cargando</option> -->
		<!-- 	{:else if $batches} -->
		<!-- 		<option disabled selected>Seleccione un lote</option> -->
		<!-- 		{#each $batches as { id, batch_code, expiration_date }} -->
		<!-- 			{#if id != $form.second_selected_batch_id} -->
		<!-- 				<option value={id}> -->
		<!-- 					{batch_code} -->
		<!-- 					{#if expiration_date} -->
		<!-- 						({new Date(expiration_date).toLocaleDateString('es')}) -->
		<!-- 					{/if} -->
		<!-- 				</option> -->
		<!-- 			{/if} -->
		<!-- 		{/each} -->
		<!-- 	{:else} -->
		<!-- 		<option disabled>No se encontraron lotes</option> -->
		<!-- 	{/if} -->
		<!-- </select> -->
		<!---->
		<!-- <!-- {#if needs_two_batches} --> -->
		<!-- 	<select -->
		<!-- 		transition:fade={{ duration: 200 }} -->
		<!-- 		class="select mt-4" -->
		<!-- 		bind:value={$form.second_selected_batch_id} -->
		<!-- 	> -->
		<!-- 		{#if $batches == 'WAITING'} -->
		<!-- 			<option disabled>Cargando</option> -->
		<!-- 		{:else if $batches} -->
		<!-- 			<option disabled selected>Seleccione un lote</option> -->
		<!-- 			{#each $batches as { id, batch_code, expiration_date }} -->
		<!-- 				{#if id != $form.selected_batch_id} -->
		<!-- 					<option value={id}> -->
		<!-- 						{batch_code} -->
		<!-- 						{#if expiration_date} -->
		<!-- 							({new Date(expiration_date).toLocaleDateString('es')}) -->
		<!-- 						{/if} -->
		<!-- 					</option> -->
		<!-- 				{/if} -->
		<!-- 			{/each} -->
		<!-- 		{:else} -->
		<!-- 			<option disabled>No se encontraron lotes</option> -->
		<!-- 		{/if} -->
		<!-- 	</select> -->
		<!-- {/if} -->
	</td>
	<!-- {#if $surpass_amount && !needs_two_batches} -->
	<!-- 	<td> -->
	<!-- 		<button -->
	<!-- 			in:fade={{ delay: 0, duration: 200 }} -->
	<!-- 			type="button" -->
	<!-- 			class="btn mx-0 px-2 variant-filled-tertiary rounded-lg" -->
	<!-- 			on:click={() => (needs_two_batches = true)} -->
	<!-- 		> -->
	<!-- 			Otro Lote -->
	<!-- 		</button> -->
	<!-- 	</td> -->
	<!-- {:else if needs_two_batches} -->
	<!-- 	<td> -->
	<!-- 		<button -->
	<!-- 			in:fade={{ delay: 0, duration: 200 }} -->
	<!-- 			type="button" -->
	<!-- 			class="btn mx-0 px-2 variant-filled-tertiary rounded-lg" -->
	<!-- 			on:click={() => { -->
	<!-- 				needs_two_batches = false; -->
	<!-- 				$form.second_selected_batch_id = null; -->
	<!-- 			}} -->
	<!-- 		> -->
	<!-- 			Quitar Lote -->
	<!-- 		</button> -->
	<!-- 	</td> -->
	<!-- {/if} -->
</tr>

