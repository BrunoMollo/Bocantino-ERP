<script lang="ts">
	import Autocomplete from '$lib/ui/Autocomplete.svelte';
	import { makeOptions } from '$lib/utils';
	export let data;

	let filas = [
		{
			materiaPrima: 'Materia prima 1',
			faltante: 200,
			lotes: [
				{ identificador: 'A807BC', cantidadDisponible: 700, cantidad: 320 },
				{ identificador: 'A8AABC', cantidadDisponible: 200, cantidad: 120 }
			]
		},
		{
			materiaPrima: 'Materia prima 2',
			faltante: 200,
			lotes: [
				{ identificador: 'A807BC', cantidadDisponible: 700, cantidad: 320 },
				{ identificador: 'A8AABC', cantidadDisponible: 200, cantidad: 120 }
			]
		},
		{
			materiaPrima: 'Materia prima 2',
			faltante: 200,
			lotes: [
				{ identificador: 'A807BC', cantidadDisponible: 700, cantidad: 320 },
				{ identificador: 'A8AABC', cantidadDisponible: 200, cantidad: 120 }
			]
		},
		{
			materiaPrima: 'Materia prima 2',
			faltante: 200,
			lotes: [
				{ identificador: 'A807BC', cantidadDisponible: 700, cantidad: 320 },
				{ identificador: 'A8AABC', cantidadDisponible: 200, cantidad: 120 }
			]
		}
	];
	const optionsIngredientsTypes = makeOptions(data.ingredients, { value: 'id', label: 'name' });
	let fecha = '19/11/2022';
	let numero = 12;
</script>

<div class="flex justify-between w-11/12 mx-auto">
	<h1 class="uppercase text-2xl my-5">Solicitud de produccion N:{numero}</h1>
	<h2 class="uppercase text-2xl my-5">Fecha: {fecha}</h2>
</div>

<form action="" class="mx-auto w-11/12">
	<div class="flex gap-6 mb-4">
		<Autocomplete
			className="w-3/12"
			name="IngredientsTypes"
			value=""
			{...optionsIngredientsTypes}
		/>
		<div class="flex">
			<h1 class="text-nowrap my-auto">Ingrese la cantidad a producir:</h1>
			<input type="text" placeholder="cantidad..." class="input w-1/3 rounded ml-3" />
		</div>
	</div>
	<table class="shadow-lg w-full rounded table">
		<thead>
			<tr class="h-10">
				<th class="w-3/12 text-center">Materia prima</th>
				<th class="w-3/12 text-center">Lote</th>
				<th class="w-2/12 text-center">Cantidad disponible</th>
				<th class="w-2/12 text-center">Cantidad</th>
				<th class="w-2/12 text-center"></th>
			</tr>
		</thead>
		<tbody class="">
			{#each filas as fila}
				<tr class="bg-black">
					<td class="text-center w-3/12">{fila.materiaPrima}<br />Faltante:{fila.faltante}</td>
					<td class="text-center w-3/12">
						{#each fila.lotes as Lote}
							{Lote.identificador}<br />
						{/each}
					</td>
					<td class="text-center w-2/12">
						{#each fila.lotes as Lote}
							{Lote.cantidadDisponible}<br />
						{/each}</td
					>
					<td class="text-center w-2/12">
						{#each fila.lotes as Lote}
							{Lote.cantidad}<br />
						{/each}</td
					>
					<td class="text-center w-2/12"><button class="btn">Agregar Lote</button></td>
				</tr>
			{/each}
		</tbody>
	</table>
</form>
