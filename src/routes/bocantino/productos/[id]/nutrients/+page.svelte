<script lang="ts">
	import { nutrient_name, nutrient_unit } from '$lib/nutrients-utils.js';

	export let data;
</script>

<article class="card p-4 pl-6 pb-10">
	<h2 class="h2 w-96">Nutrientes de {data.product.desc}</h2>

	<div class="container p-0 relative border-b mt-6 w-80">
		{#each data.nutritional_info as { identifier, amount }}
			<div class="flex justify-between border-t py-1 px-3 h-14">
				<span class="text-center my-auto">{nutrient_name(identifier)}</span>
				<span class="text-center my-auto">{amount} {nutrient_unit(identifier)}/100gr</span>
			</div>
		{/each}
	</div>
</article>
