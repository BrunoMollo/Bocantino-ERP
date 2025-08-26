<script lang="ts">
	import { TreeView, TreeViewItem } from '@skeletonlabs/skeleton';
	import CompleteTable from '../_components/complete-table.svelte';

	export let data;
	let { products } = data;

	let searchTerm = '';
	let selectedFilter = 'all'; // 'all' | 'name' | 'id' | 'ingredient'
	
	$: filteredProducts = (() => {
		if (!searchTerm.trim()) return products;
		const term = searchTerm.toLowerCase().trim();
		return products.filter((p) => {
			switch (selectedFilter) {
				case 'name':
					return p.desc.toLowerCase().includes(term);
				case 'id':
					return p.id.toString().includes(term);
				case 'ingredient':
					return (p.ingredients ?? []).some((ing) => (ing?.name ?? '').toLowerCase().includes(term));
				default:
					return (
						p.desc.toLowerCase().includes(term) ||
						p.id.toString().includes(term) ||
						(p.ingredients ?? []).some((ing) => (ing?.name ?? '').toLowerCase().includes(term))
					);
			}
		});
	})();

	function clearSearch() {
		searchTerm = '';
		selectedFilter = 'all';
	}
</script>

<div class="card p-6 shadow-lg">
	<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
		<div>
			<h1 class="h1 text-primary-600">Productos</h1>
			<p class="text-surface-600-400-token">Gestiona tus productos y sus recetas</p>
		</div>
		<a href="productos/add" class="btn variant-filled-primary">
			<i class="bx bx-plus text-xl mr-2"></i>
			Agregar Producto
		</a>
	</div>

	<div class="card p-4 mb-6 bg-surface-50-900-token border border-surface-200-700-token">
		<div class="flex flex-col md:flex-row gap-3 items-end">
			<div class="flex-1">
				<label class="label mb-1" for="searchTerm"><span>Buscar</span></label>
				<div class="relative">
					<i class="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-surface-500-400-token pointer-events-none" aria-hidden="true"></i>
					<input
						id="searchTerm"
						type="text"
						placeholder="Buscar productos..."
						bind:value={searchTerm}
						class="input pl-10 w-full h-11 rounded-lg"
						autocomplete="off"
						aria-label="Buscar productos"
					/>
				</div>
			</div>
			<div>
				<label class="label mb-1" for="fieldFilter"><span>Campo</span></label>
				<select id="fieldFilter" bind:value={selectedFilter} class="select w-44 h-10 text-sm rounded-lg">
					<option value="all">Todos</option>
					<option value="name">Nombre</option>
					<option value="ingredient">Ingrediente</option>
					<option value="id">ID</option>
				</select>
			</div>
			{#if searchTerm}
				<button on:click={clearSearch} class="btn variant-soft-secondary h-10">
					<i class="bx bx-x text-xl"></i>
					Limpiar
				</button>
			{/if}
		</div>
		{#if searchTerm}
			<div class="mt-2 text-sm text-surface-600-400-token">
				Mostrando {filteredProducts.length} de {products.length} productos
			</div>
		{/if}
	</div>

	<div class="overflow-x-auto">
		<table class="table table-hover shadow-lg rounded-lg w-full">
			<thead>
				<tr class="bg-surface-100-800-token">
					<th class="text-left p-4">ID</th>
					<th class="text-left p-4">Producto</th>
					<th class="text-left p-4">Ingredientes</th>
					<th class="text-center p-4">Acciones</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredProducts as { id, desc, ingredients }}
					<tr class="align-middle h-16 hover:bg-surface-50-900-token transition-colors">
						<td class="w-1/12 p-4 font-mono text-sm">{id}</td>
						<td class="w-3/12 p-4 font-medium">{desc}</td>
						<td class="w-5/12 p-4">
							<TreeView>
								<TreeViewItem>
									Receta
									<svelte:fragment slot="children">
										{#each ingredients as { name, amount, unit }}
											<TreeViewItem class="grid justify-between">
												{name} ({amount} {unit})
											</TreeViewItem>
										{/each}
									</svelte:fragment>
								</TreeViewItem>
							</TreeView>
						</td>
						<td class="w-3/12 p-4">
							<div class="flex justify-center gap-2">
								<a class="btn-icon btn-icon-sm variant-soft-secondary hover:variant-filled-secondary transition-all" href="/bocantino/productos/{id}/edit" title="Editar">
									<i class="bx bx-edit text-lg"></i>
								</a>
								<a class="btn-icon btn-icon-sm variant-soft-tertiary hover:variant-filled-tertiary transition-all" href="/bocantino/productos/{id}/nutrients" title="Nutrientes">
									<i class="bx bx-info-circle text-lg"></i>
								</a>
							</div>
						</td>
					</tr>
				{/each}
				{#if filteredProducts.length === 0}
					<tr>
						<td colspan="4" class="text-center p-8 text-surface-500-400-token">
							{#if searchTerm}
								<div class="flex flex-col items-center gap-2">
									<i class="bx bx-search text-4xl"></i>
									<p>No se encontraron productos que coincidan con "{searchTerm}"</p>
									<button on:click={clearSearch} class="btn variant-soft-primary">Limpiar búsqueda</button>
								</div>
							{:else}
								<div class="flex flex-col items-center gap-2">
									<i class="bx bx-package text-4xl"></i>
									<p>No hay productos registrados</p>
									<a href="productos/add" class="btn variant-filled-primary">Agregar primer producto</a>
								</div>
							{/if}
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>

	{#if products.length > 10}
		<div class="mt-6 flex justify-center">
			<CompleteTable list={filteredProducts} rows={10} />
		</div>
	{/if}
</div>

<style>
	table tbody td {
		vertical-align: middle;
	}
</style>
