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
	import Spinner from '$lib/ui/Spinner.svelte';

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
				const match = url.pathname
					.split('/')
					.filter((_, i) => i < 3)
					.join('/');

				if (match === href) {
					return name;
				}
			}
		}
		return '';
	});
</script>

<Drawer>
	<div class="pt-4 w-96">
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
				<a href="/bocantino">
					<strong class="text-xl uppercase py-auto">Bocantino</strong>
				</a>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>

	<!-- Page Route Content -->
	{#if $navigating}
		<div class="w-full h-full flex items-center justify-center">
			<Spinner showIf={true} size={36} />
		</div>
	{:else}
		<slot />
	{/if}
</AppShell>

