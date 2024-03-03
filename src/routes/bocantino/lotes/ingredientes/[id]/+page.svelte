<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';

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
				<button class="bg-black m-3 p-3 rounded-full h-12 w-12 align-middle shadow-md"
					><i class="bx bx-arrow-back text-2xl"></i></button
				>
			</div>
		</a>
		<div class="p-6">
			<div class="flex justify-between pb-3">
				<p class="text-2xl">Id: {data.batch.ingredient.id}</p>
				<p class="text-2xl">Materia prima: {data.batch.ingredient.name}</p>
				<p class="text-2xl">Unidad: {data.batch.ingredient.unit}</p>
			</div>
			<p class="text-2xl">Codigo lote: {data.batch.batch_code}</p>

			<p class="text-xl">
				Fecha vencimiento: {data.batch.expiration_date?.toLocaleDateString('es') ?? '-'}
			</p>
			<p class="text-xl mb-10">Cantidad actual: {data.batch.current_amount}</p>

			<form action="" method="post" use:enhance class="flex flex-col">
				<label class="label" for="adjustment">Cantidad Perdida</label>
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
</main>
