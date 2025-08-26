<script lang="ts">
	import { AppShell, AppBar, Toast, type PopupSettings, popup } from '@skeletonlabs/skeleton';
	import { Drawer, getDrawerStore } from '@skeletonlabs/skeleton';
	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import { navigating, page } from '$app/stores';
	import { derived } from 'svelte/store';
	import { routes } from './_components/routes';
	import Navigation from './_components/Navigation.svelte';
	import { fade } from 'svelte/transition';
	import Loader from './_components/Loader.svelte';
	import { LightSwitch } from '@skeletonlabs/skeleton';
	import PopUpDashboard from './_components/popUp-dashboard.svelte';

	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	const drawerStore = getDrawerStore();

	const popupFeatured: PopupSettings = {
		event: 'click',
		target: 'popupFeatured',
		placement: 'bottom'
	};

	const title = derived(page, ({ url }) => {
		for (let group of routes) {
			for (let { href, name } of group.routes) {
				if (href.match(url.pathname) !== null) {
					return name;
				}
			}
		}
		return '';
	});

	let debounce_flag = null as object | null;
	navigating.subscribe((x) => {
		setTimeout(() => (debounce_flag = x), 360);
	});

	let ShowPopUp = false;
</script>

<Drawer>
	<div class="pt-4 md:w-96 w-70 bg-gradient-to-b from-surface-0-50-token to-surface-50-900-token h-full">
		<div class="w-full flex justify-between items-center p-6 border-b border-surface-200-700-token">
			<a href="/bocantino" class="flex items-center gap-3 group">
				<strong class="text-2xl font-bold text-primary-600 group-hover:text-primary-500 transition-colors">Bocantino</strong>
			</a>
			<div class="flex items-center gap-2">
				<LightSwitch rounded={'rounded-xl'} />
				<button on:click={drawerStore.close} class="btn-icon btn-icon-sm variant-soft-secondary md:hidden">
					<i class="bx bx-x text-xl"></i>
				</button>
			</div>
		</div>
		<div class="p-4">
			<Navigation />
		</div>
	</div>
</Drawer>

<Toast class="w-80" />
<!-- App Shell -->
<AppShell slotSidebarLeft="w-0">
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar class="bg-surface-0-50-token border-b border-surface-200-700-token shadow-sm">
			<svelte:fragment slot="lead">
				<div class="flex items-center gap-4">
					<button 
						class="btn btn-sm variant-soft-secondary hover:variant-filled-secondary transition-all" 
						on:click={() => drawerStore.open({ width: '800px' })}
					>
						<i class="bx bx-menu text-xl"></i>
					</button>
					<div class="flex items-center gap-3">
						<h1 class="h2 text-primary-600 font-semibold">{$title}</h1>
					</div>
				</div>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<div class="flex items-center gap-3">
					<button
						style="display: none"
						class="btn variant-filled-secondary rounded-full"
						use:popup={popupFeatured}
					>
						<i class="bx bx-notification text-xl"></i>
					</button>
					{#if $page.url.pathname === '/bocantino'}
						<div class="card p-4 w-72 shadow-xl rounded-lg" data-popup="popupFeatured">
							<div><h1 class="text-xl uppercase">Notifications:</h1></div>
							<div class="arrow bg-surface-100-800-token" />
						</div>
						<div class="relative">
							<button
								class="btn variant-filled-secondary rounded-full"
								on:click={() => (ShowPopUp = !ShowPopUp)}
							>
								<i class="bx bxs-edit text-xl"></i>
							</button>
							<div
								class="card p-4 w-72 shadow-xl absolute right-0 top-20 rounded-lg z-50"
								class:invisible={!ShowPopUp}
							>
								<PopUpDashboard />
							</div>
						</div>
					{/if}

					<a href="/bocantino" class="hidden md:flex items-center gap-2">
						<strong class="text-xl font-bold text-primary-600">Bocantino</strong>
					</a>
				</div>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>

	{#if $navigating && debounce_flag}
		<div class="w-full h-full flex items-center justify-center absolute opacity-90 bg-surface-0-50-token z-50" transition:fade>
			<Loader />
		</div>
	{:else}
		<div class="p-6">
			<slot />
		</div>
	{/if}
</AppShell>
