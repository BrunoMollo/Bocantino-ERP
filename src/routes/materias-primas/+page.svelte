<script lang="ts">
	import { page } from '$app/stores';

	export let data;

	async function eliminar(id: number) {
		try {
			const response = await fetch($page.url + '/delete/' + id, { method: 'POST' });
			if (response.status == 200) {
				data.list = data.list.filter((_, i) => data.list[i].id !== id);
			}
		} catch (error) {}
	}
</script>

<table class="table table-hover shadow-lg rounded-lg w-11/12">
	<thead>
		<tr>
			<th>ID</th>
			<th>Nombre</th>
			<th>Unidad</th>
			<th></th>
		</tr>
	</thead>
	<tbody>
		{#each data.list as ingredient}
			<tr class="align-middle">
				<td class="w-2/12 align-middle">{ingredient.id}</td>
				<td class="w-3/12">{ingredient.name}</td>
				<td class="w-2/12">{ingredient.unit}</td>
				<td class="w-2/12">
					<a
						class="my-2 btn-icon btn-icon-md variant-soft-secondary mr-5"
						href="/materias-primas/edit/{ingredient.id}"
					>
						<i class="bx bx-edit place-self-center text-2xl"></i></a
					>
					<button
						on:click={() => eliminar(ingredient.id)}
						class="my-2 btn-icon btn-icon-md variant-soft-secondary"
					>
						<i class="bx bxs-trash place-self-center text-2xl"></i></button
					>
				</td>
			</tr>
		{/each}
		{#if 10 - data.list.length > 0}
			{#each Array(10 - data.list.length) as _}
				<tr>
					<td />
					<td />
					<td />
					<td />
				</tr>
			{/each}
		{/if}
	</tbody>
</table>

<style>
	.table tbody td {
		vertical-align: middle;
	}
</style>
