<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<nav class="list-nav card w-11/12">
	<ul>
		<li>
			<div class="w-full flex pl-4 pt-2 border-solid border-b-2 border-surface-500">
				<span class="w-1/5 font-bold uppercase">id</span>
				<span class="w-4/12 font-bold uppercase">nombre</span>
				<span class="w-2/5 font-bold uppercase pl-1">unidad</span>
			</div>
		</li>
		{#each data.list as tipoMateriaPrima}
			<li>
				<a href="/materias-primas/edit/{tipoMateriaPrima.id}" class="w-full">
					<span class="w-1/5"> {tipoMateriaPrima.id}</span>
					<span class="w-4/12"> {tipoMateriaPrima.name}</span>
					<span class="w-2/5"> {tipoMateriaPrima.unit}</span>
					<i class="bx bx-edit text-lg"></i>
				</a>
			</li>
		{/each}
	</ul>
</nav>
