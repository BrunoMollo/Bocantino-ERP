<script lang="ts">
	import { name_nutrient, unit_nutrient } from '$lib/utils.js';

	export let data;
</script>

<article class="card p-4 pl-6 pb-10">
	<h2 class="h2 w-96">Nutrientes de {data.product.desc}</h2>

	<div class="container p-0 relative border-b mt-6 w-80">
		{#each data.nutritional_info as { identifier, amount }}
			<div class="flex justify-between border-t py-1 px-3 h-14">
				<span class="text-center my-auto">{name_nutrient(identifier)}</span>
				<span class="text-center my-auto">{amount} {unit_nutrient(identifier)}/100gr</span>
			</div>
		{/each}
	</div>
</article>
