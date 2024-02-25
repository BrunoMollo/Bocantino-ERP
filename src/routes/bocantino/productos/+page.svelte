<script lang="ts">
	import { TreeView, TreeViewItem } from '@skeletonlabs/skeleton';
	import CompleteTable from '../_components/complete-table.svelte';

	export let data;
	let { products } = data;
</script>

<div class="table-container w-11/12 rounded-lg shadow-lg">
	<table class="table table-hover">
		<thead>
			<tr>
				<th>ID</th>
				<th>Producto</th>
				<th>Ingredientes</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each products as { id, desc, ingredients }}
				<tr>
					<td class="w-1/12">{id}</td>
					<td class="w-2/12">{desc}</td>
					<td class="w-4/12">
						<TreeView>
							<TreeViewItem>
								Receta
								<svelte:fragment slot="children">
									{#each ingredients as { name, amount, unit }}
										<TreeViewItem class="grid justify-between">
											{name} ({amount}
											{unit})
										</TreeViewItem>
									{/each}
								</svelte:fragment>
							</TreeViewItem>
						</TreeView>
					</td>
					<td class="w-1/12">
						<a
							class="my-2 mr-5 btn-icon btn-icon-md variant-soft-secondary"
							href="/bocantino/productos/edit/{id}"
						>
							<i class="bx bx-edit place-self-center text-2xl"></i>
						</a>
					</td>
				</tr>
			{/each}
			<CompleteTable list={products} rows={4} />
		</tbody>
	</table>
</div>

<style>
	table tbody td {
		vertical-align: middle;
	}
</style>

