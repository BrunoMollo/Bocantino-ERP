<script lang="ts">
	import { TabAnchor, TabGroup } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';
	export let routes: Array<{ name: string; href: string }>;
</script>

<TabGroup active="variant-filled-primary" border="border-solid border-b border-primary-500">
	{#each routes as { name, href }}
		<TabAnchor {href} selected={$page.url.pathname === href}>
			<span>{name}</span>
		</TabAnchor>
	{/each}
</TabGroup>

