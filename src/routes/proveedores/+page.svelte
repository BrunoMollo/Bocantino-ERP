<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
    import { TreeView, TreeViewItem, RecursiveTreeView, type TreeViewNode } from '@skeletonlabs/skeleton';
	import proveedorForm from './proveedorForm.svelte';
    const materiasPrimas = [1,2,3,4,5,6,7,8,9,10];
    const proveedores = [
        {nombre: 'Proveedor1',
        email: 'Proveedor1@gmail.com',
        materias:["Papa", "Zapallo"]},
        {nombre: 'Proveedor2',
        email: 'Proveedor2@gmail.com',
        materias:["Zanahoria", "Huevos", "Harina"]
    },{
        nombre: 'Proveedor3',
        email: 'Proveedor3@gmail.com',
        materias:["Papa", "Zapallo", "Huevos"]
    },{
        nombre: 'Proveedor4',
        email: 'Proveedor4@gmail.com',
        materias:["Papas"]
    }]

</script>


<div class="table-container w-11/12" style="border-radius: 10px; box-shadow: 0 6px 12px rgba(0,0,0,0.8)">
	<table class="table table-hover">
		<thead>
			<tr>
				<th>ID</th>
				<th>Proveedor</th>
				<th>Email</th>
				<th>Materias primas</th>
			</tr>
		</thead>
		<tbody >
			{#each proveedores as proveedor,i}
				<tr class="align-middle">
                    <td class="align-middle">{i}</td>
					<td>{proveedor.nombre}</td>
                    <td>{proveedor.email}</td>
                    <TreeView>
                        <TreeViewItem >
                            Expandir materias primas
                            <svelte:fragment slot="children">
                                {#each proveedor.materias as materiaPrima, i}
                                    <TreeViewItem class="grid justify-between">
                                        {materiaPrima}
                                        <i class='bx bx-edit align-middle' style="font-size:24px;"></i>
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



				