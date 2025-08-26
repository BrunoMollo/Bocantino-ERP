<script lang="ts">
	import { page } from '$app/stores';
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import { routes } from './routes';
	import { dev } from '$app/environment';

	const drawerStore = getDrawerStore();
</script>

<nav class="space-y-6">
	<!-- Hidden anchor for styling -->
	<a class="invisible" href={$page.url.href} on:click={drawerStore.close}>ok</a>
	
	<ul class="space-y-6">
		{#each routes as group}
			<li>
				<div class="flex items-center gap-3 px-4 py-2 mb-3">
					<div class="w-8 h-8 bg-primary-100-800-token rounded-lg flex items-center justify-center">
						<i class={`bx text-lg text-primary-600-400-token ${group.icon}`}></i>
					</div>
					<h3 class="font-semibold text-surface-800-200-token uppercase tracking-wide text-sm">
						{group.name}
					</h3>
				</div>
				<ul class="space-y-2">
					{#each group.routes.filter((x) => !x.omit_from_menu) as { name, href, icon }}
						<li>
							<a
								class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-surface-100-800-token hover:shadow-md group"
								{href}
								on:click={() => setTimeout(drawerStore.close, 120)}
								class:active={$page.url.pathname === href}
								tabindex="0"
							>
								<div class="w-6 h-6 flex items-center justify-center">
									<i class={`bx text-lg transition-colors ${icon} ${$page.url.pathname === href ? 'text-primary-600-400-token' : 'text-surface-600-400-token group-hover:text-primary-600-400-token'}`}></i>
								</div>
								<span class="font-medium transition-colors {$page.url.pathname === href ? 'text-primary-600-400-token' : 'text-surface-700-300-token group-hover:text-primary-600-400-token'}">
									{name}
								</span>
								{#if $page.url.pathname === href}
									<div class="ml-auto w-2 h-2 bg-primary-500 rounded-full"></div>
								{/if}
							</a>
						</li>
					{/each}
				</ul>
			</li>
		{/each}
	</ul>

	{#if dev}
		<div class="pt-6 border-t border-surface-200-700-token">
			<a
				class="flex items-center gap-3 px-4 py-3 rounded-xl bg-warning-100-800-token text-warning-600-400-token hover:bg-warning-200-800-token transition-all duration-200"
				href="/-dev"
				on:click={() => {
					drawerStore.close();
				}}
			>
				<i class="bx bx-code-block text-lg"></i>
				<span class="font-medium">Dev Mode</span>
			</a>
		</div>
	{/if}
</nav>

<style>
	.active {
		background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
		color: white;
		box-shadow: 0 4px 12px rgba(var(--color-primary-500), 0.3);
	}
	
	.active i {
		color: white !important;
	}
	
	.active span {
		color: white !important;
	}
</style>
