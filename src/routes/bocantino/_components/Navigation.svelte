<script lang="ts">
	import { page } from '$app/stores';
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import { routes } from './routes';
	import { dev } from '$app/environment';

	const drawerStore = getDrawerStore();
</script>

<nav class="list-nav p-4">
	<!-- fist one is styled wierdly -->
	<a class="invisible" href={$page.url.href} on:click={drawerStore.close}>volver</a>

	<ul class="px-4">
		{#each routes as group}
			<li class="pb-5">
				<div class="px-4 pb-1 w-full flex justify-between uppercase h-full">
					<i class={`bx text-xl ${group.icon}`}></i>
					<p class="align-middle my-auto">{group.name}</p>
				</div>
				<ul>
					{#each group.routes as { name, href, icon }}
						<li>
							<a
								class="btn variant-filled w-full flex justify-between hover:text-slate-50 uppercase"
								{href}
								on:click={() => setTimeout(drawerStore.close, 120)}
								class:active={$page.url.pathname === href}
								tabindex="0"
							>
								<i class={`bx text-xl ${icon}`}></i>
								{name}
							</a>
						</li>
					{/each}
				</ul>
			</li>
		{/each}
	</ul>

	{#if dev}
		<a
			class=""
			href="/bocantino/-dev"
			on:click={() => {
				drawerStore.close();
			}}>dev (!)</a
		>
	{/if}
</nav>

<style>
	a {
		border-radius: 12px;
		box-shadow:
			0 10px 15px -3px rgb(0 0 0 / 0.1),
			0 4px 6px -4px rgb(0 0 0 / 0.1);
	}
	.active {
		background-color: #055361;
		color: whitesmoke;
	}
</style>
