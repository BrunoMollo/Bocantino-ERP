<script lang="ts">
	import { TreeView, TreeViewItem } from '@skeletonlabs/skeleton';

	export let data;
	const { suppliers } = data;
</script>

<div
	class="table-container w-11/12"
	style="border-radius: 10px; box-shadow: 0 6px 12px rgba(0,0,0,0.8)"
>
	<table class="table table-hover">
		<thead>
			<tr>
				<th>ID</th>
				<th>Proveedor</th>
				<th>Email</th>
				<th>Materias primas</th>
			</tr>
		</thead>
		<tbody>
			{#each suppliers as { id, name, email, ingredients }}
				<tr class="align-middle">
					<td class="align-middle">{id}</td>
					<td>{name}</td>
					<td>{email}</td>
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
				</tr>
			{/each}
		</tbody>
	</table>
</div>
