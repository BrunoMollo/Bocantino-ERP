<script lang="ts">
	import { TreeView, TreeViewItem } from '@skeletonlabs/skeleton';
	import type { PageData } from './$types';

	export let data: PageData;
	const { proveedores } = data;
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
			{#each proveedores as proveedor, i}
				<tr class="align-middle">
					<td class="align-middle">{i}</td>
					<td>{proveedor.nombre}</td>
					<td>{proveedor.email}</td>
					<TreeView>
						<TreeViewItem>
							Expandir materias primas
							<svelte:fragment slot="children">
								{#each proveedor.materias as materiaPrima}
									<TreeViewItem class="grid justify-between">
										{materiaPrima}
										<i class="bx bx-edit align-middle" style="font-size:24px;"></i>
									</TreeViewItem>
								{/each}
							</svelte:fragment>
						</TreeViewItem>
					</TreeView>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

