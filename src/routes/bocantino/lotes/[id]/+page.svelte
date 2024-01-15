<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';

	export let data;

	const { form, enhance, errors, delayed } = superForm(data.form, { defaultValidator: 'clear' });
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
				<h1 class="text-2xl">Id: {data.batch.ingredient.id}</h1>
				<h1 class="text-2xl">Materia prima: {data.batch.ingredient.name}</h1>
				<h1 class="text-2xl">Unidad: {data.batch.ingredient.unit}</h1>
			</div>
			<h1 class="text-2xl">Codigo lote: {data.batch.batch_code}</h1>
			<h1 class="text-xl">
				Fecha vencimiento: {data.batch.expiration_date?.toDateString()}
			</h1>
			<h1 class="text-xl mb-10">Cantidad actual: {data.batch.current_amount}</h1>

			<form action="" method="post" use:enhance class="flex flex-col">
				<label class="label" for="loss">Cantidad Perdida</label>
				<div>
					<input
						class="input mb-4 w-20"
						class:error_border={$errors.loss}
						name="loss"
						type="number"
						id="loss"
						bind:value={$form.loss}
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
