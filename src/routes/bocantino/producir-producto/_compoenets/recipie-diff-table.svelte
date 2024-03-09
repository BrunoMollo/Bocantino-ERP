<script lang="ts">
	import { arraify_nutritional_info, name_nutrient } from '$lib/utils';
	import type { NutritionalInfo } from '$logic/nutricional-information-service';

	export let base: NutritionalInfo;
	export let modified: NutritionalInfo;
</script>

<div class="container p-0 relative border-b mt-6 w-[460px] text-center">
	<div class="flex justify-between border-t py-1 h-14">
		<span class=" my-auto w-3/12 text-start">Nutriente</span>
		<span class=" my-auto w-1/12">Receta</span>
		<span class=" my-auto w-1/12">Modificado</span>
		<span class=" my-auto w-2/12">Differencia</span>
	</div>
	{#each arraify_nutritional_info(base) as { identifier, amount }}
		{@const expected_amount = amount}
		{@const current_amount = modified[identifier]}
		<div class="flex justify-between border-t py-1 h-14">
			<span class=" my-auto w-3/12 text-start">{name_nutrient(identifier)}</span>
			<span class=" my-auto w-1/12">{expected_amount} </span>
			<span class=" my-auto w-1/12">{current_amount} </span>
			<span class=" my-auto w-2/12">{current_amount - expected_amount} </span>
		</div>
	{/each}
</div>
