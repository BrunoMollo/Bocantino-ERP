<script lang="ts">
	import { name_nutrient } from '$lib/utils.js';

	export let data;
</script>

<article class="card p-4">
	<h2 class="h2">Nutrientes Producto</h2>

	<div class="container p-0 relative border-b">
		{#each data.nutritional_info as { identifier, amount }}
			<div class="flex justify-between border-t py-1 px-3 h-14">
				<span class="text-center my-auto">{name_nutrient(identifier)}</span>
				<span class="text-center my-auto">{amount} gr/100gr</span>
			</div>
		{/each}
	</div>
</article>
