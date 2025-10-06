<script lang="ts">
	import '../app.postcss';
	import { getToastStore, initializeStores } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
	import { goto, onNavigate } from '$app/navigation';
	import { dev } from '$app/environment';
	import { onMount } from 'svelte';

	initializeStores();

	const toastStore = getToastStore();
	page.subscribe(async ({ url }) => {
		const message = url.searchParams.get('toast');
		if (message) {
			toastStore.trigger({ message, timeout: 1500, classes: 'end-0' });
			url.searchParams.delete('toast'); // remove searchParam to avoid multiple triggers
			const query = new URLSearchParams(url.searchParams.toString());
			await goto(`${url.pathname}?${query.toString()}`);
		}
	});

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
	const title = dev ? 'DEV-BOCANTIO' : 'Bocantino';

	onMount(() => {
		try {
			const root = document.documentElement;
			const persist = () => {
				const isDark = root.classList.contains('dark');
				localStorage.setItem('mode', isDark ? 'dark' : 'light');
			};
			persist();
			const observer = new MutationObserver((mutations) => {
				for (const m of mutations) {
					if (m.type === 'attributes' && m.attributeName === 'class') persist();
				}
			});
			observer.observe(root, { attributes: true, attributeFilter: ['class'] });
			return () => observer.disconnect();
		} catch {
			console.log('esto no deberia pasar, saludos');
		}
	});
</script>

<svelte:head>
	<title>{title}</title>
	<link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet" />
</svelte:head>

<slot />
