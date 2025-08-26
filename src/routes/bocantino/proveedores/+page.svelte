<script lang="ts">
	import { TreeView, TreeViewItem } from '@skeletonlabs/skeleton';
	import CompleteTable from '../_components/complete-table.svelte';

	export let data;
	const { suppliers } = data;

	let searchTerm = '';
	let selectedFilter = 'all'; // 'all' | 'name' | 'cuit' | 'email' | 'id'
	
	$: filteredSuppliers = (() => {
		if (!searchTerm.trim()) return suppliers;
		const term = searchTerm.toLowerCase().trim();
		return suppliers.filter((s) => {
			switch (selectedFilter) {
				case 'name':
					return s.name.toLowerCase().includes(term);
				case 'cuit':
					return s.cuit.toLowerCase().includes(term);
				case 'email':
					return s.email.toLowerCase().includes(term);
				case 'id':
					return s.id.toString().includes(term);
				default:
					return (
						s.name.toLowerCase().includes(term) ||
						s.cuit.toLowerCase().includes(term) ||
						s.email.toLowerCase().includes(term) ||
						s.id.toString().includes(term)
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
			<h1 class="h1 text-primary-600">Proveedores</h1>
			<p class="text-surface-600-400-token">Gestiona tus proveedores y materias primas asociadas</p>
		</div>
		<a href="proveedores/add" class="btn variant-filled-primary">
			<i class="bx bx-plus text-xl mr-2"></i>
			Agregar Proveedor
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
						placeholder="Buscar proveedores..."
						bind:value={searchTerm}
						class="input pl-10 w-full h-11 rounded-lg"
						autocomplete="off"
						aria-label="Buscar proveedores"
					/>
				</div>
			</div>
			<div>
				<label class="label mb-1" for="fieldFilter"><span>Campo</span></label>
				<select id="fieldFilter" bind:value={selectedFilter} class="select w-44 h-10 text-sm rounded-lg">
					<option value="all">Todos</option>
					<option value="name">Nombre</option>
					<option value="cuit">CUIT</option>
					<option value="email">Email</option>
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
				Mostrando {filteredSuppliers.length} de {suppliers.length} proveedores
			</div>
		{/if}
	</div>

	<div class="overflow-x-auto">
		<table class="table table-hover shadow-lg rounded-lg w-full">
			<thead>
				<tr class="bg-surface-100-800-token">
					<th class="text-left p-4">ID</th>
					<th class="text-left p-4">Proveedor</th>
					<th class="text-left p-4">CUIT</th>
					<th class="text-left p-4">Teléfono</th>
					<th class="text-left p-4">Email</th>
					<th class="text-left p-4">Materias primas</th>
					<th class="text-center p-4">Acciones</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredSuppliers as { id, name, email, ingredients, cuit, phone_number }}
					<tr class="align-middle h-16 hover:bg-surface-50-900-token transition-colors">
						<td class="align-middle p-4 font-mono text-sm">{id}</td>
						<td class="p-4 font-medium">{name}</td>
						<td class="p-4">{cuit}</td>
						<td class="p-4">{phone_number}</td>
						<td class="p-4">{email}</td>
						<td class="p-4">
							<TreeView>
								<TreeViewItem>
									Expandir materias primas
									<svelte:fragment slot="children">
										{#each ingredients as ingredient}
											<TreeViewItem class="grid justify-between">
												{ingredient.name}
											</TreeViewItem>
										{/each}
										{#if ingredients.length === 0}
											<TreeViewItem class="grid justify-between">
												No tiene ingredientes asignados
											</TreeViewItem>
										{/if}
									</svelte:fragment>
								</TreeViewItem>
							</TreeView>
						</td>
						<td class="p-4">
							<div class="flex justify-center">
								<a class="btn-icon btn-icon-sm variant-soft-secondary hover:variant-filled-secondary transition-all" href="/bocantino/proveedores/edit/{id}" title="Editar">
									<i class="bx bx-edit text-lg"></i>
								</a>
							</div>
						</td>
					</tr>
				{/each}
				{#if filteredSuppliers.length === 0}
					<tr>
						<td colspan="7" class="text-center p-8 text-surface-500-400-token">
							{#if searchTerm}
								<div class="flex flex-col items-center gap-2">
									<i class="bx bx-search text-4xl"></i>
									<p>No se encontraron proveedores que coincidan con "{searchTerm}"</p>
									<button on:click={clearSearch} class="btn variant-soft-primary">Limpiar búsqueda</button>
								</div>
							{:else}
								<div class="flex flex-col items-center gap-2">
									<i class="bx bx-group text-4xl"></i>
									<p>No hay proveedores registrados</p>
									<a href="proveedores/add" class="btn variant-filled-primary">Agregar primer proveedor</a>
								</div>
							{/if}
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>

	{#if suppliers.length > 10}
		<div class="mt-6 flex justify-center">
			<CompleteTable list={filteredSuppliers} rows={10} />
		</div>
	{/if}
</div>

<style>
	table tbody td {
		vertical-align: middle;
	}
</style>
