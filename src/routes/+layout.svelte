<script lang="ts">
	import '../app.postcss';
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
</script>

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<a href="/">
					<strong class="text-xl uppercase">Bocantino</strong>
				</a>
			</svelte:fragment>
			<svelte:fragment slot="trail"></svelte:fragment>
		</AppBar>
	</svelte:fragment>

	<svelte:fragment slot="sidebarLeft">
		<ul id="sidebar-left" class="lg:block w-5/12 h-full p-6 pt-5 bg-surface-900 grid grid-cols-1">
			<a class="btn variant-filled mb-5 w-full" href="/materias-primas">Materias primas</a>
			<a class="btn variant-filled mb-5 w-full" href="#">Proveedores</a>
			<a class="btn variant-filled mb-5 w-full" href="#">Productos</a>
			<a class="btn variant-filled mb-5 w-full" href="#">Lotes</a>
		</ul>
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>
