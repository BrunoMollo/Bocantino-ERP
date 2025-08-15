<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import { printIngredientBatchLabel } from '../../../ingreso-insumos/_shared/pdf-batch-label';

	export let data;

	const { form, enhance, errors, delayed } = superForm(data.form, {
		defaultValidator: 'clear',
		taintedMessage: null,
		onError: ({ result }) => alert(`ERROR: ${result.error.message}`)
	});
</script>

<main class="container mx-auto mt-10">
	<div class="card mx-auto p-4 w-4/6">
		<a href="./">
			<div>
				<button class="m-3 p-3 rounded-full h-12 w-12 align-middle shadow-md card"
					><i class="bx bx-arrow-back text-2xl"></i></button
				>
			</div>
		</a>
		<div class="flex justify-between">
			<div class="p-6">
				<p class="text-2xl"><span class="font-bold">Id:</span> {data.batch.ingredient.id}</p>
				<p class="text-2xl">
					<span class="font-bold">Materia prima: </span>{data.batch.ingredient.name}
				</p>
				<p class="text-2xl"><span class="font-bold">Codigo lote: </span>{data.batch.batch_code}</p>
				<p class="text-2xl">
					<span class="font-bold"> Fecha producción:</span>
					{data.batch.production_date?.toLocaleDateString('es') ?? '-'}
				</p>
				<p class="text-2xl">
					<span class="font-bold"> Fecha vencimiento:</span>
					{data.batch.expiration_date?.toLocaleDateString('es') ?? '-'}
				</p>
				<p class="text-xl mb-10">
					<span class="font-bold">Cantidad actual:</span>
					{data.batch.current_amount}
					{data.batch.ingredient.unit}
				</p>
			</div>
			<div class="grid grid-cols-1 p-4 justify-items-center">
			<button class="btn variant-outline-primary w-32 rounded mb-5" on:click={printIngredientBatchLabel(data.batch)} >
						{#if $delayed}
							........
						{:else}
							<i class="bx bx-printer text-xl h-5 w-5"></i>
						{/if}
					</button>
			<form action="" method="post" use:enhance class="flex flex-col p-6">
				<label class="label font-bold" for="adjustment">Ajuste</label>
				<div>
					<input
						class="input mb-4 w-20"
						class:error_border={$errors.adjustment}
						name="adjustment"
						type="number"
						step=".001"
						id="adjustment"
						bind:value={$form.adjustment}
					/>
					<span>{data.batch.ingredient.unit}</span>
				</div>
					<button class="btn variant-filled-primary w-32 rounded" type="submit">
						{#if $delayed}
							........
						{:else}
							Registrar
						{/if}
					</button>
			</form>
			</div>
		</div>
	</div>
</main>
