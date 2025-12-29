<script lang="ts">
	import { trpc } from '$lib/trpc-client';
	import CompleteTable from '../_components/complete-table.svelte';

	export let data;

	let searchTerm = '';
	let selectedFilter = 'all'; // 'all', 'name', 'unit', 'id'

	// Reactive filtered data
	$: filteredIngredients = (() => {
		if (!searchTerm.trim()) return data.list;

		const term = searchTerm.toLowerCase().trim();
		return data.list.filter((ingredient) => {
			switch (selectedFilter) {
				case 'name':
					return ingredient.name.toLowerCase().includes(term);
				case 'unit':
					return ingredient.unit.toLowerCase().includes(term);
				case 'id':
					return ingredient.id.toString().includes(term);
				default:
					return (
						ingredient.name.toLowerCase().includes(term) ||
						ingredient.unit.toLowerCase().includes(term) ||
						ingredient.id.toString().includes(term)
					);
			}
		});
	})();

	async function deleteIngredient(id: number) {
		if (!confirm('¿Está seguro de que desea eliminar esta materia prima?')) return;
		try {
			const msj = await trpc.ingredient.delete.mutate(id);
			if (msj == 'OK') {
				data.list = data.list.filter((_, i) => data.list[i].id !== id);
			} else {
				alert('Algo salio mal');
			}
		} catch (error) {
			alert('Algo salio mal');
		}
	}

	function clearSearch() {
		searchTerm = '';
		selectedFilter = 'all';
	}
</script>

<div class="card p-6 shadow-lg">
	<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
		<div>
			<h1 class="h1 text-primary-600">Materias Primas</h1>
			<p class="text-surface-600-400-token">Gestiona tus ingredientes y materias primas</p>
		</div>
		<a href="materias-primas/add" class="btn variant-filled-primary">
			<i class="bx bx-plus text-xl mr-2"></i>
			Agregar Materia Prima
		</a>
	</div>

	<!-- Search and Filter Section -->
	<div class="card p-4 mb-6 bg-surface-50-900-token border border-surface-200-700-token">
		<div class="flex flex-col md:flex-row gap-3 items-end">
			<div class="flex-1">
				<label class="label mb-1" for="searchTerm"><span>Buscar</span></label>
				<div class="relative">
					<i
						class="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-surface-500-400-token pointer-events-none"
						aria-hidden="true"
					></i>
					<input
						id="searchTerm"
						type="text"
						placeholder="Buscar materias primas..."
						bind:value={searchTerm}
						class="input pl-10 w-full h-11 rounded-lg"
						autocomplete="off"
						aria-label="Buscar materias primas"
					/>
				</div>
			</div>
			<div>
				<label class="label mb-1" for="fieldFilter"><span>Campo</span></label>
				<select
					id="fieldFilter"
					bind:value={selectedFilter}
					class="select w-44 h-10 text-sm rounded-lg"
				>
					<option value="all">Todos</option>
					<option value="name">Nombre</option>
					<option value="unit">Unidad</option>
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
				Mostrando {filteredIngredients.length} de {data.list.length} materias primas
			</div>
		{/if}
	</div>

	<!-- Table Section -->
	<div class="overflow-x-auto">
		<table class="table table-hover shadow-lg rounded-lg w-full">
			<thead>
				<tr class="bg-surface-100-800-token">
					<th class="text-left p-4">ID</th>
					<th class="text-left p-4">Nombre</th>
					<th class="text-left p-4">Unidad</th>
					<th class="text-left p-4">Punto de Pedido</th>
					<th class="text-center p-4">Acciones</th>
				</tr>
			</thead>
			<tbody>
				{#each filteredIngredients as ingredient}
					<tr class="align-middle h-16 hover:bg-surface-50-900-token transition-colors">
						<td class="w-2/12 align-middle p-4 font-mono text-sm">{ingredient.id}</td>
						<td class="w-3/12 p-4 font-medium">{ingredient.name}</td>
						<td class="w-2/12 p-4">
							<span class="badge variant-soft-primary">{ingredient.unit}</span>
						</td>
						<td class="w-2/12 p-4">{ingredient.reorder_point}</td>
						<td class="w-2/12 p-4">
							<div class="flex justify-center gap-2">
								<a
									class="btn-icon btn-icon-sm variant-soft-secondary hover:variant-filled-secondary transition-all"
									href="materias-primas/edit/{ingredient.id}"
									title="Editar"
								>
									<i class="bx bx-edit text-lg"></i>
								</a>
								<button
									on:click={() => deleteIngredient(ingredient.id)}
									class="btn-icon btn-icon-sm variant-soft-error hover:variant-filled-error transition-all"
									title="Eliminar"
								>
									<i class="bx bxs-trash text-lg"></i>
								</button>
							</div>
						</td>
					</tr>
				{/each}
				{#if filteredIngredients.length === 0}
					<tr>
						<td colspan="5" class="text-center p-8 text-surface-500-400-token">
							{#if searchTerm}
								<div class="flex flex-col items-center gap-2">
									<i class="bx bx-search text-4xl"></i>
									<p>No se encontraron materias primas que coincidan con "{searchTerm}"</p>
									<button on:click={clearSearch} class="btn variant-soft-primary">
										Limpiar búsqueda
									</button>
								</div>
							{:else}
								<div class="flex flex-col items-center gap-2">
									<i class="bx bx-package text-4xl"></i>
									<p>No hay materias primas registradas</p>
									<a href="materias-primas/add" class="btn variant-filled-primary">
										Agregar primera materia prima
									</a>
								</div>
							{/if}
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>

	<!-- Pagination -->
	{#if data.list.length > 10}
		<div class="mt-6 flex justify-center">
			<CompleteTable list={filteredIngredients} rows={10} />
		</div>
	{/if}
</div>

<style>
	.table tbody td {
		vertical-align: middle;
	}

	.badge {
		@apply px-2 py-1 text-xs font-medium rounded-full;
	}
</style>
