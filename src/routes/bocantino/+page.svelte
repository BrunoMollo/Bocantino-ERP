<script lang="ts">
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import { printProductionOrder } from './solicitudes-pendientes/_shared/pdf-production-order.js';
	import { items } from '$lib/dashboard-items';

	export let data;
	let buscados = '';

	$: ingredientes = data.ingredients;

	function mostrarIngreso(id: number) {
		window.location.href = 'bocantino/insumos-ingresados/' + id;
		return null;
	}

	function filtrar() {
		ingredientes = data.ingredients.filter((ingrediente) => {
			return ingrediente.name.toLocaleLowerCase().includes(buscados.toLocaleLowerCase());
		});
	}
</script>

<div class="space-y-6">

	<!-- Search and Ingredients Section -->
	<div class="card p-6">
		<div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center mb-6">
			<div class="flex-1 relative">
				<i class="bx bx-search absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-500-400-token"></i>
				<input
					class="input pl-10 w-full"
					placeholder="Buscar materias primas..."
					bind:value={buscados}
					on:input={filtrar}
				/>
			</div>
			<div class="text-sm text-surface-500-400-token">
				{ingredientes.length} materias primas encontradas
			</div>
		</div>
		
		<div class="flex overflow-x-auto gap-4 pb-4">
			{#if ingredientes.length === 0}
				<div class="card p-6 w-96 shadow-lg rounded-lg bg-surface-50-900-token border border-surface-200-700-token">
					<div class="text-center">
						<i class="bx bx-search text-4xl text-surface-400-500-token mb-2"></i>
						<h3 class="text-lg font-medium text-surface-600-400-token">No se encontraron materias primas...</h3>
					</div>
				</div>
			{/if}
			{#each ingredientes as { id, name, stock, reorder_point }}
				<div
					class="shrink-0 card w-96 p-6 rounded-xl shadow-lg relative transition-all duration-200 hover:shadow-xl"
					class:bg-error-50-900-token={stock < reorder_point}
					class:bg-success-50-900-token={stock >= reorder_point}
					class:border-error-200-700-token={stock < reorder_point}
					class:border-success-200-700-token={stock >= reorder_point}
				>
					<div class="flex justify-between items-start mb-4">
						<div>
							<span class="text-sm font-mono text-surface-500-400-token">ID: {id}</span>
							<h3 class="text-xl font-bold text-surface-800-200-token mt-1">{name}</h3>
						</div>
						<div class="flex items-center gap-2">
							{#if stock < reorder_point}
								<span class="badge variant-filled-error text-xs">Stock Bajo</span>
							{:else}
								<span class="badge variant-filled-success text-xs">Stock OK</span>
							{/if}
						</div>
					</div>
					
					<div class="space-y-2 mb-4 w-1/2">
						<div class="flex justify-between text-sm">
							<span class="text-surface-600-400-token">Punto de pedido:</span>
							<span class="font-medium">{reorder_point}</span>
						</div>
						<div class="flex justify-between text-sm">
							<span class="text-surface-600-400-token">Stock actual:</span>
							<span class="font-medium">{Math.round(stock * 10) / 10}</span>
						</div>
					</div>
					
					<div class="absolute right-4 bottom-4">
						{#if stock < reorder_point}
							<ProgressRadial
								width="w-20"
								font={96}
								stroke={70}
								value={(stock / reorder_point) * 100}
							>
								{Math.round((stock / reorder_point) * 100)}%
							</ProgressRadial>
						{:else}
							<ProgressRadial width="w-20" font={96} stroke={70} value={100}>
								<i class="bx bx-check text-success-500 text-lg"></i>
								{Math.round((stock / reorder_point) * 100)}%
							</ProgressRadial>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Main Content -->
	<main class="grid lg:grid-cols-3 gap-6">
		<!-- Pending Productions -->
		{#if $items[0].show}
			<div class="card p-6 lg:col-span-2">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-10 h-10 rounded-lg flex items-center justify-center">
						<i class="bx bx-time text-warning-600-400-token text-xl"></i>
					</div>
					<h2 class="h2 text-surface-800-200-token">Producciones Pendientes</h2>
				</div>
				
				{#if data.pending_productions.length == 0}
					<div class="text-center py-8">
						<i class="bx bx-check-circle text-4xl text-success-500 mb-2"></i>
						<p class="text-surface-600-400-token">No hay solicitudes pendientes</p>
					</div>
				{:else}
					<div class="overflow-x-auto">
						<table class="table table-hover">
							<thead>
								<tr class="bg-surface-100-800-token">
									<th class="text-left p-3">ID</th>
									<th class="text-left p-3">Producto</th>
									<th class="text-left p-3">Cantidad</th>
									<th class="text-center p-3">Acciones</th>
								</tr>
							</thead>
							<tbody>
								{#each data.pending_productions as pendiente}
									<tr class="hover:bg-surface-50-900-token transition-colors">
										<td class="p-3 font-mono text-sm">{pendiente.id}</td>
										<td class="p-3 font-medium">{pendiente.product.desc}</td>
										<td class="p-3">{pendiente.initial_amount}</td>
										<td class="p-3 text-center">
											<button
												class="btn btn-sm variant-soft-primary hover:variant-filled-primary transition-all"
												on:click={printProductionOrder(pendiente.product.desc, pendiente)}
												title="Imprimir orden"
											>
												<i class="bx bx-printer text-lg"></i>
											</button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Latest Entries -->
		{#if $items[1].show}
			<div class="card p-6">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-10 h-10 bg-info-100-800-token rounded-lg flex items-center justify-center">
						<i class="bx bx-package text-info-600-400-token text-xl"></i>
					</div>
					<h2 class="h2 text-surface-800-200-token">Últimos Ingresos</h2>
				</div>
				
				{#if data.entries.length == 0}
					<div class="text-center py-8">
						<i class="bx bx-package text-4xl text-surface-400-500-token mb-2"></i>
						<p class="text-surface-600-400-token">No hay ingresos recientes</p>
					</div>
				{:else}
					<div class="space-y-3">
						{#each data.entries as entrada}
							<div class="flex items-center justify-between p-3 bg-surface-50-900-token rounded-lg hover:bg-surface-100-800-token transition-colors">
								<div class="flex items-center gap-3">
									<div class="w-8 h-8 bg-primary-100-800-token rounded-lg flex items-center justify-center">
										<span class="text-xs font-mono text-primary-600-400-token">{entrada.id}</span>
									</div>
									<div>
										<p class="font-medium text-surface-700-300-token truncate max-w-24">{entrada.supplier}</p>
										<p class="text-xs text-surface-500-400-token">{entrada.creation_date.toLocaleDateString('es')}</p>
									</div>
								</div>
								<button
									type="button"
									class="btn btn-sm variant-soft-primary hover:variant-filled-primary transition-all"
									on:click={mostrarIngreso(entrada.id)}
									title="Ver detalles"
								>
									<i class="bx bx-show text-lg"></i>
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<!-- Quick Actions -->
		<div class="card p-6">
			<div class="flex items-center gap-3 mb-4">
				<div class="w-10 h-10 rounded-lg flex items-center justify-center">
					<i class="bx bx-plus text-primary-600-400-token text-xl"></i>
				</div>
				<h2 class="h2 text-surface-800-200-token">Acciones Rápidas</h2>
			</div>
			
			<div class="space-y-3">
				<a href="/bocantino/materias-primas/add" class="btn variant-soft-primary w-full justify-start">
					<i class="bx bx-plus text-lg mr-2"></i>
					Nueva Materia Prima
				</a>
				<a href="/bocantino/productos/add" class="btn variant-soft-secondary w-full justify-start">
					<i class="bx bx-package text-lg mr-2"></i>
					Nuevo Producto
				</a>
				<a href="/bocantino/proveedores/add" class="btn variant-soft-tertiary w-full justify-start">
					<i class="bx bx-user-plus text-lg mr-2"></i>
					Nuevo Proveedor
				</a>
			</div>
		</div>
	</main>
</div>

<style>
	.badge {
		@apply px-2 py-1 text-xs font-medium rounded-full;
	}
</style>
