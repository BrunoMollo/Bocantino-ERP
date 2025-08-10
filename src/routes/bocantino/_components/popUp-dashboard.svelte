<script lang="ts">
	import { items } from '$lib/dashboard-items';

	function toggleSwitch(event: Event) {
		const button = event?.currentTarget as HTMLButtonElement;
		const handle = button.querySelector('.switch-handle') as HTMLSpanElement;
		const index = Number(button.dataset.index);
		$items[index].show = !$items[index].show;
		if ($items[index].show) {
			button.classList.replace('bg-gray-300', 'bg-green-500');
			handle.classList.add('translate-x-6');
		} else {
			button.classList.replace('bg-green-500', 'bg-gray-300');
			handle.classList.remove('translate-x-6');
		}
	}
</script>

<div>
	<div class="flex flex-col gap-5">
		{#each $items as item, index}
			<div class="flex justify-between">
				<p>{item.name}</p>
				<div class="flex items-center">
					<span class="mr-2 text-gray-600">Off</span>
					<button
						class="switch-button relative inline-flex h-6 w-12 items-center rounded-full bg-green-500 transition-colors duration-300 focus:outline-none"
						on:click={toggleSwitch}
						data-index={index}
					>
						<span
							class="switch-handle absolute left-1 h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 translate-x-6"
						></span>
					</button>
					<span class="ml-2 text-gray-600">On</span>
				</div>
			</div>
		{/each}
	</div>
</div>
