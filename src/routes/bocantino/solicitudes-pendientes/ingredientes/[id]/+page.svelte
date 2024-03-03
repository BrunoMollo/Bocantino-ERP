<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';

	export let data;
	const { form, enhance, delayed, errors } = superForm(data.form, {
		taintedMessage: null,
		dataType: 'json', // needed for id
		defaultValidator: 'clear',
		onError: ({ result }) => {
			if (result.type == 'error') {
				alert(result.error.message);
			}
		}
	});

	const { enhance: cancel_enhance } = superForm(data.cancel_form, {
		taintedMessage: null,
		defaultValidator: 'clear',
		dataType: 'json', // needed for id
		onError: ({ result }) => {
			if (result.type == 'error') {
				alert(result.error.message);
			}
		}
	});
</script>

<div class="card w-9/12 md:w-2/4 m-auto mt-14 shadow-lg rounded-lg">
	<button class="bg-black m-3 p-3 rounded-full h-12 w-12 align-middle shadow-md">
		<i class="bx bx-arrow-back text-2xl"></i>
	</button>
	<div class="px-10">
		<h2 class="h2 text-primary-200">Solicitud pendiente {data.batch.id}</h2>
		<p>
			Cantidad producida: {data.batch.initial_amount}
			{data.batch.ingredient?.unit} de {data.batch.ingredient.name}.
		</p>
		{#each data.batch.used_batches ?? [] as used_batch}
			<p>
				Uso {used_batch?.amount_used_to_produce_batch}
				{data.batch.used_ingredient.unit} del lote {used_batch?.batch_code}
			</p>
		{/each}

		<h3 class="h3 pt-4">Finalizar produccion</h3>
		<form class="flex flex-col" method="post" action="?/finish" use:enhance>
			<div class="mb-4">
				<label class="label" for="adjustment">Ajuste:</label>
				<div>
					<input
						type="number"
						step=".01"
						class="input w-40 mr-2"
						id="adjustment"
						bind:value={$form.adjustment}
						class:error_border={$errors.adjustment}
					/>
					<span>{data.batch.ingredient?.unit}</span>
				</div>
			</div>

			<div class="flex pb-7 pt-3 w-full justify-between">
				<button class="btn variant-filled-primary w-40" type="submit">
					{#if $delayed}
						Cerrando...
					{:else}
						Cerrar produccion
					{/if}
				</button>

				<form action="?/cancel" method="post" use:cancel_enhance>
					<button
						class="btn variant-filled-error w-40"
						type="submit"
						on:click={(event) => {
							const question =
								'Estas seguro que quieres eliminar este lote?\nEsta accion no se puede deshacer';
							if (!confirm(question)) {
								event.preventDefault();
							}
						}}
					>
						Eliminar solicitud
					</button>
				</form>
			</div>
		</form>
	</div>
</div>
