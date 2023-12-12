<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;

	function eliminar(id: number) {
		data.list = data.list.filter((_, i) => data.list[i].id !== id);
	}
</script>

<table class="table table-hover shadow-lg rounded-lg w-11/12">
	<thead>
		<tr>
			<th>ID</th>
			<th>Nombre</th>
			<th>Unidad</th>
			<th>Stock</th>
			<th></th>
		</tr>
	</thead>
	<tbody>
		{#each data.list as tipoMateriaPrima}
			<tr class="align-middle">
				<td class="w-1/12 align-middle">{tipoMateriaPrima.id}</td>
				<td class="w-2/12">{tipoMateriaPrima.name}</td>
				<td class="w-2/12">{tipoMateriaPrima.unit}</td>
				<td class="w-2/12"></td>
				<td class="w-1/12">
					<a
						class="my-2 btn-icon btn-icon-md variant-soft-secondary mr-5"
						href="/materias-primas/edit/{tipoMateriaPrima.id}"
					>
						<i class="bx bx-edit place-self-center text-2xl"></i></a
					>
					<button
						on:click={() => eliminar(tipoMateriaPrima.id)}
						class="my-2 btn-icon btn-icon-md variant-soft-secondary"
					>
						<i class="bx bxs-trash place-self-center text-2xl"></i></button
					>
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	.table tbody td {
		vertical-align: middle;
	}
</style>
