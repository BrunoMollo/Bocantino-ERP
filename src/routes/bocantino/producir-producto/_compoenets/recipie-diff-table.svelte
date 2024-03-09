<script lang="ts">
	import { arraify_nutritional_info, name_nutrient } from '$lib/utils';
	import type { NutritionalInfo } from '$logic/nutricional-information-service';

	export let base: NutritionalInfo;
	export let modified: NutritionalInfo;
	const rgb = (r: number, g: number, b: number) => `rgb(${r},${g},${b})`;
	function getColor(numericValue: number) {
		const abs = Math.abs(numericValue);
		const red = Math.min(255, abs * 25); // Adjust the multiplier as needed
		const green = 255 - red;
		return rgb(red, green, 0);
	}
</script>

<div class="container p-0 relative border-b mt-6 w-[460px] text-center">
	<div class="flex justify-between py-1 h-14">
		<span class="my-auto w-3/12 text-start">Nutriente</span>
		<span class="my-auto w-1/12">Receta</span>
		<span class="my-auto w-1/12">Modificado</span>
		<span class="my-auto w-2/12">Cambio</span>
	</div>
	{#each arraify_nutritional_info(base) as { identifier, amount }}
		{@const expected_amount = amount}
		{@const current_amount = Math.round(modified[identifier] * 10_000) / 10_000}
		{@const diff = Math.round((current_amount - expected_amount) * 10_000) / 10_000}
		<div class="flex justify-between border-t py-1 h-14">
			<span class="my-auto w-3/12 text-start">{name_nutrient(identifier)}</span>
			<span class="my-auto w-1/12">{expected_amount} </span>
			<span class="my-auto w-1/12">{current_amount} </span>
			<span class="my-auto w-2/12 font-black" style:color={getColor(diff)}>{diff} </span>
		</div>
	{/each}
</div>
