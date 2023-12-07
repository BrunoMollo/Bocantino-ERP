<script lang="ts">
	import { TreeView, TreeViewItem } from '@skeletonlabs/skeleton';

	export let data;
	const { products } = data;
</script>

<div
	class="table-container w-11/12"
	style="border-radius: 10px; box-shadow: 0 6px 12px rgba(0,0,0,0.8)"
>
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
			{#each products as {id, desc, ingredients}}
				<tr >
					<td >{id}</td>
					<td>{desc}</td>
					<td>
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
					<td class="grid">
						<a class="btn-icon btn-icon-md variant-soft-secondary" href="/productos/edit/{id}">
							<i class="bx bx-edit place-self-center text-2xl"></i>
						</a>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
