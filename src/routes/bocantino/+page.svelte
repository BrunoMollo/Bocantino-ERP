<script lang="ts">
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	export let data;
</script>

<main class="container h-full mx-auto flex justify-center items-start">
	<div
		class="snap-x scroll-px-4 snap-mandatory scroll-smooth flex gap-4 overflow-x-auto px-4 py-10"
	>
		{#each data.ingredients as { id, name, stock, reorderPoint }}
			<div
				class=" shrink-0 card p-5 h-52 w-96 rounded-lg shadow-lg relative"
				style:background-color={stock < reorderPoint ? 'rgba(127, 29, 29, 0.4)' : ''}
				style:box-shadow={stock < reorderPoint ? '0 2px 25px 2px rgba(255, 0, 0, 0.8)' : ''}
			>
				{#if stock < reorderPoint}
					<div class="border">
						<i class="bx bx-alarm-exclamation absolute right-12 text-xl pt-1"></i>
						<p class="absolute right-4 top-11">Stock bajo</p>
					</div>
					<div class="absolute right-5 bottom-4">
						<ProgressRadial
							width="w-24"
							font={128}
							stroke={70}
							value={(stock / reorderPoint) * 100}
						>
							{Math.round((stock / reorderPoint) * 100)}%
						</ProgressRadial>
					</div>
				{/if}
				<h1>ID:{id}</h1>
				<h2 class="uppercase text-xl self-end w-9/12">{name}</h2>
				<p class="mt-3">Punto de pedido: {reorderPoint}</p>
				<p>Stock real: {stock}</p>
			</div>
		{/each}
	</div>
</main>

