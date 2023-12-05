<script lang="ts">
	import '../app.postcss';
	import { AppShell, AppBar, Toast, getToastStore } from '@skeletonlabs/skeleton';
	import { initializeStores, Drawer, getDrawerStore } from '@skeletonlabs/skeleton';
	import Navigation from './Navigation.svelte';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	initializeStores();
	const drawerStore = getDrawerStore();

	const toastStore = getToastStore();
	page.subscribe(({ url }) => {
		const message = url.searchParams.get('toast');
		if (message) {
			toastStore.trigger({ message, timeout: 1500, classes: 'end-0' });
		}
	});
</script>

<svelte:head>
	<link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet" />
</svelte:head>

<Drawer>
	<div class="pt-4">
		<strong class="p-4 text-xl uppercase">Bocantino</strong>
		<Navigation />
	</div>
</Drawer>

<Toast class="w-64" />
<!-- App Shell -->
<AppShell slotSidebarLeft="w-0 lg:w-64  bg-surface-900 ">
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<div class="flex items-center">
					<button
						class="lg:hidden btn btn-sm mr-4"
						on:click={() => drawerStore.open({ width: '64px' })}
					>
						<span>
							<svg viewBox="0 0 100 80" class="fill-token w-4 h-4">
								<rect width="100" height="20" />
								<rect y="30" width="100" height="20" />
								<rect y="60" width="100" height="20" />
							</svg>
						</span>
					</button>
				</div>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<a href="/">
					<strong class="text-xl uppercase">Bocantino</strong>
				</a>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>

	<svelte:fragment slot="sidebarLeft">
		<Navigation />
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>
