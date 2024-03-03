<script lang="ts">
	import { trpc } from '$lib/trpc-client';
	import CompleteTable from '../_components/complete-table.svelte';

	export let data;

	async function deleteIngredient(id: number) {
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
</script>

<table class="table table-hover shadow-lg rounded-lg w-11/12">
	<thead>
		<tr>
			<th>ID</th>
			<th>Nombre</th>
			<th>Unidad</th>
			<th>Punto de pedido</th>
			<th></th>
		</tr>
	</thead>
	<tbody>
		{#each data.list as ingredient}
			<tr class="align-middle h-16">
				<td class="w-2/12 align-middle">{ingredient.id}</td>
				<td class="w-3/12">{ingredient.name}</td>
				<td class="w-2/12">{ingredient.unit}</td>
				<td class="w-2/12">{ingredient.reorder_point}</td>
				<td class="w-2/12">
					<a
						class="btn-icon btn-icon-md variant-soft-secondary"
						href="materias-primas/edit/{ingredient.id}"
					>
						<i class="bx bx-edit place-self-center text-xl"></i></a
					>
					<button
						on:click={() => deleteIngredient(ingredient.id)}
						class=" btn-icon btn-icon-md variant-soft-secondary"
					>
						<i class="bx bxs-trash place-self-center text-xl"></i></button
					>
				</td>
			</tr>
		{/each}
		<CompleteTable list={data.list} rows={5} />
	</tbody>
</table>

<style>
	.table tbody td {
		vertical-align: middle;
	}
</style>
