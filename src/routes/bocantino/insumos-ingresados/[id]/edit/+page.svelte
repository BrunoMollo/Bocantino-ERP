<script lang="ts">
	import Spinner from '$lib/ui/Spinner.svelte';
	import { fade } from 'svelte/transition';
	import { superForm } from 'sveltekit-superforms/client';

	export let data;
	const { form, enhance, errors, delayed } = superForm(data.form, {
		onError: ({ result }) => alert(`ERROR: ${result.error.message}`),
		dataType: 'json',
		taintedMessage: null
	});
</script>

<div class="card p-6 w-4/6">
	<h2 class="h2">Alta Tipo Materia Prima</h2>
	<form class="flex flex-col gap-4 p-9 w-full" action="" method="post" use:enhance>
		<label for="name" class="label">
			<span
				>Nombre:
				{#if $errors.name}
					<b class=" text-error-400" transition:fade>{$errors.name}</b>
				{/if}
			</span>
		</label>
		<input
			style="margin-top:-10px"
			placeholder="nombre del nuevo ingrediente"
			class={`input ${$errors.name ? 'input-error' : ''} w-5/6`}
			name="name"
			type="text"
			id="name"
			bind:value={$form.name}
		/>

		<button class="btn variant-filled-primary" type="submit">
			<b>Editar</b>
			<Spinner showIf={$delayed} size={4} />
		</button>
	</form>
</div>
