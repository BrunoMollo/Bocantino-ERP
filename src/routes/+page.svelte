<script lang="ts">
	import { ProgressRadial, type PopupSettings } from "@skeletonlabs/skeleton";
	let value: number = 50;
	let listaTipos = [{
		id:1,
		nombre: "Papa",
		unidad: "kg",
		stockD: 2000,
		stockR: 340
	},{
		id:2,
		nombre: "Zapallo",
		unidad: "kg",
		stockD: 2000,
		stockR: 1900
	},{
		id:3,
		nombre: "Pera",
		unidad: "kg",
		stockD: 2000,
		stockR: 730
	},{
		id:4,
		nombre: "Banana",
		unidad: "kg",
		stockD: 2000,
		stockR: 320
	},{
		id:5,
		nombre: "Papa",
		unidad: "kg",
		stockD: 2000,
		stockR: 1400
	},{
		id:6,
		nombre: "Papa",
		unidad: "kg",
		stockD: 2000,
		stockR: 1900
	},{
		id:7,
		nombre: "Papa",
		unidad: "kg",
		stockD: 2000,
		stockR: 1900
	},{
		id:8,
		nombre: "Papa",
		unidad: "kg",
		stockD: 2000,
		stockR: 1900
	}]
</script>
<main class="container h-full mx-auto flex justify-center items-start mt-4">	
	<div class="snap-x scroll-px-4 snap-mandatory scroll-smooth flex gap-4 overflow-x-auto px-4 py-10">
		{#each listaTipos as tipoMateriaPrima}
			<div class=" shrink-0 card p-5 h-56 w-40 md:w-80 rounded-lg shadow-lg relative" style="background-color:{tipoMateriaPrima.stockR/tipoMateriaPrima.stockD > 0.5 ? "" : "rgba(127, 29, 29, 0.4)"};box-shadow:{tipoMateriaPrima.stockR/tipoMateriaPrima.stockD > 0.5 ? "" : "0 2px 25px 2px rgba(255, 0, 0, 0.8)"}">
				{#if tipoMateriaPrima.stockR/tipoMateriaPrima.stockD < 0.5}
				<div class="border">
					<i class='bx bx-alarm-exclamation absolute right-12 text-xl'></i>
					<p class="absolute right-5 top-10">Stock bajo</p>
				</div>
				<div class="absolute right-5 bottom-4">
					<ProgressRadial width="w-24" font={128} stroke={70} value="{tipoMateriaPrima.stockR/tipoMateriaPrima.stockD * 100}">{Math.round(tipoMateriaPrima.stockR/tipoMateriaPrima.stockD * 100)}%</ProgressRadial>
				</div>
				{/if}
				<h1>ID:{tipoMateriaPrima.id}</h1>
				<h2 class="uppercase text-xl self-end">{tipoMateriaPrima.nombre}</h2>
				<p class="mt-3">Stock desado: {tipoMateriaPrima.stockD}</p>
				<p>Stock real: {tipoMateriaPrima.stockR}</p>
			</div>
		{/each}
	</div>
</main>
