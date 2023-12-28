<script lang="ts">
	import '../app.postcss';
	import {
		AppShell,
		AppBar,
		Toast,
		getToastStore,
		type PopupSettings,
		popup
	} from '@skeletonlabs/skeleton';
	import { initializeStores, Drawer, getDrawerStore } from '@skeletonlabs/skeleton';
	import Navigation from './_components/Navigation.svelte';
	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
	import { derived } from 'svelte/store';
	import { routes } from './_components/routes';

	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	initializeStores();
	const drawerStore = getDrawerStore();

	const popupFeatured: PopupSettings = {
		// Represents the type of event that opens/closed the popup
		event: 'click',
		// Matches the data-popup value on your popup element
		target: 'popupFeatured',
		// Defines which side of your trigger the popup will appear
		placement: 'bottom'
	};

	const toastStore = getToastStore();
	page.subscribe(({ url }) => {
		const message = url.searchParams.get('toast');
		if (message) {
			toastStore.trigger({ message, timeout: 1500, classes: 'end-0' });
		}
	});

	const title = derived(page, ({ url }) => {
		for (let group of routes) {
			for (let { href, name } of group.routes) {
				if (url.pathname === href) {
					return name;
				}
			}
		}
		return '';
	});
</script>

<svelte:head>
	<link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet" />
</svelte:head>

<Drawer>
	<div class="pt-4 w-80">
		<strong class="p-4 text-xl uppercase">Bocantino</strong>
		<Navigation />
	</div>
</Drawer>

<Toast class="w-64" />
<!-- App Shell -->
<AppShell slotSidebarLeft="w-0  bg-surface-900 ">
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<div class="flex items-center">
					<button class="btn btn-sm mr-4" on:click={() => drawerStore.open({ width: '800px' })}>
						<span>
							<svg viewBox="0 0 100 80" class="fill-token w-4 h-4">
								<rect width="100" height="20" />
								<rect y="30" width="100" height="20" />
								<rect y="60" width="100" height="20" />
							</svg>
						</span>
					</button>
				</div>
				<h1 class="h2 pl-4">{$title}</h1>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<button class="btn variant-filled-secondary rounded-full mr-4" use:popup={popupFeatured}
					><i class="bx bx-notification text-2xl"></i></button
				>
				<div class="card p-4 w-72 shadow-xl rounded-lg" data-popup="popupFeatured">
					<div><h1 class="text-xl uppercase">Notifications:</h1></div>
					<div class="arrow bg-surface-100-800-token" />
				</div>
				<a href="/">
					<strong class="text-xl uppercase py-auto">Bocantino</strong>
				</a>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>

	<!-- Page Route Content -->
	<slot />
</AppShell>
