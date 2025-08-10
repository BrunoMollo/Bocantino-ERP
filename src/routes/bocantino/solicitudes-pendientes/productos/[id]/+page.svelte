<script lang="ts">
	import { IconPaperBag } from '@tabler/icons-svelte';
	import { superForm } from 'sveltekit-superforms/client';

	export let data;
	const current = data.batch;

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
</script>

<div class="card w-9/12 md:w-2/4 m-auto mt-14 shadow-lg rounded-lg">
	<a
		href="/bocantino/solicitudes-pendientes/productos"
		class="block card m-3 p-3 rounded-full h-12 w-12 align-middle shadow"
	>
		<i class="bx bx-arrow-back text-2xl"></i>
	</a>
	<div class="px-10">
		<h2 class="h2 my-5">Solicitud pendiente {current?.id}</h2>
		<p class="text-xl">
			Producto: {current?.product.desc}
		</p>
		<p class="text-xl">
			Producción estimada: {current?.initial_amount} Kg
		</p>
		<dl class="list-dl">
			{#each current?.used_batches ?? [] as { ingredient_name, ingredient_unit, amount_used_to_produce_batch, batch_code }}
				<div class="card shadow">
					<span class="badge p-2 shadow rounded"><IconPaperBag /></span>
					<span class="flex-auto">
						<dt class="text-l">
							<span class="font-bold">
								{amount_used_to_produce_batch}
								{ingredient_unit}</span
							>
							de {ingredient_name}
						</dt>
						<dd class="opacity-50">
							Lote : <span class="font-bold">{batch_code}</span>
						</dd>
					</span>
				</div>
			{/each}
		</dl>

		<h3 class="h3 pt-4">Finalizar produccion</h3>
		<form class="flex flex-col" method="post" action="?/finish" use:enhance>
			<div class="mb-4 flex align-middle items-center gap-3">
				<label class="label" for="adjustment">Cantidad real producida:</label>
				<div>
					<input
						type="number"
						step=".01"
						class="input w-40 mr-2"
						id="adjustment"
						bind:value={$form.real_production}
						class:error_border={$errors.real_production}
					/>
					<span>Kg</span>
				</div>
			</div>

			<div class="flex pb-7 pt-3 w-full justify-between">
				<button class="btn variant-filled-primary w-40 rounded" type="submit">
					{#if $delayed}
						Cerrando...
					{:else}
						Ingresar a Stock
					{/if}
				</button>

				<form action="?/cancel" method="post" use:cancel_enhance>
					<button
						class="btn variant-filled-error rounded w-40"
						type="submit"
						on:click={(event) => {
							const question =
								'Estas seguro que quieres eliminar este lote?\nEsta accion no se puede deshacer';
							if (!confirm(question)) {
								event.preventDefault();
							}
						}}
					>
						Eliminar Solicitud
					</button>
				</form>
			</div>
		</form>
	</div>
</div>
