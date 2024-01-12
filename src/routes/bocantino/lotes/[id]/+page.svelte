<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';

	export let data;

	const { form, enhance, errors, delayed } = superForm(data.form, { defaultValidator: 'clear' });
</script>

<main class="container pt-6 pb-24 flex flex-col justify-center items-center">
	<div class="card p-6 w-4/6">
		<pre>{JSON.stringify(data.batch, null, 2)}</pre>

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
			<button class="btn variant-filled w-32" type="submit">
				{#if $delayed}
					........
				{:else}
					Registrar
				{/if}
			</button>
		</form>
	</div>
</main>

