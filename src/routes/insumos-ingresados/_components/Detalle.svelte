<script lang="ts">
	export let idEntrada: string;
	function borrar() {
		idEntrada = '';
	}
	let data: {
		supplierId: number;
		idDocumentType: number;
		invoiceNumber: string;
		issueDate: Date;
		batches: [
			{
				batch_code: string;
				initialAmount: number;
				productionDate: Date;
				expirationDate: Date;
				ingredientId: number;
				cost: number;
				numberOfBags: number;
			}
		];
	};
</script>

<div
	style="background-color:red;"
	class="absolute inset-24 {idEntrada != '' ? '' : 'hidden'} rounded-md"
>
	<div>
		<button on:click={borrar} class="bg-black m-3 p-3 rounded-full h-12 w-12 align-middle shadow-md"
			><i class="bx bx-arrow-back text-2xl"></i></button
		>
	</div>
	<h1>{idEntrada}</h1>
</div>

<style>
</style>
