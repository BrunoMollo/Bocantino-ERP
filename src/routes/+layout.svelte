<script lang="ts">
	import '../app.postcss';
	import { getToastStore, initializeStores } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
	import { goto, onNavigate } from '$app/navigation';

	initializeStores();

	const toastStore = getToastStore();
	page.subscribe(({ url }) => {
		const message = url.searchParams.get('toast');
		if (message) {
			toastStore.trigger({ message, timeout: 1500, classes: 'end-0' });
			goto(url.href.split('?')[0]); // to avoid multple triggers
		}
	});

	onNavigate((navigation) => {
		//@ts-ignore
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			//@ts-ignore
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<title>Bocantino</title>
	<link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet" />
</svelte:head>

<slot />

