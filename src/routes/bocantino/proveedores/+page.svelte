<script lang="ts">
	import { TreeView, TreeViewItem } from '@skeletonlabs/skeleton';
	import CompleteTable from '../_components/complete-table.svelte';

	export let data;
	const { suppliers } = data;
</script>

<div class="table-container w-11/12 shadow-lg rounded-lg">
	<table class="table table-hover">
		<thead>
			<tr>
				<th>ID</th>
				<th>Proveedor</th>
				<th>Cuit</th>
				<th>Direccion</th>
				<th>Email</th>
				<th>Materias primas</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each suppliers as { id, name, email, ingredients, cuit, phone_number }}
				<tr class="align-middle">
					<td class="align-middle">{id}</td>
					<td>{name}</td>
					<td>{cuit}</td>
					<td>{phone_number}</td>
					<td>{email}</td>
					<td>
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

					<td class="w-1/12">
						<a
							class="my-2 mr-5 btn-icon btn-icon-md variant-soft-secondary"
							href="/bocantino/proveedores/edit/{id}"
						>
							<i class="bx bx-edit place-self-center text-2xl"></i>
						</a>
					</td>
				</tr>
			{/each}
			<CompleteTable list={suppliers} rows={7} />
		</tbody>
	</table>
</div>
