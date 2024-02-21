<script>
	import { IconPaperBag } from '@tabler/icons-svelte';
	import { superForm } from 'sveltekit-superforms/client';

	export let data;
	const current = {};

	const { form: cancel_form, enhance } = superForm(
		{},
		{
			taintedMessage: null,
			defaultValidator: 'clear',
			dataType: 'json', // needed for id
			onError: ({ result }) => {
				if (result.type == 'error') {
					alert(result.error.message);
				}
			},
			onUpdated: ({ form }) => {}
		}
	);
</script>

<div class="card w-9/12 md:w-2/4 m-auto mt-14 shadow-lg rounded-lg">
	<button class="bg-black m-3 p-3 rounded-full h-12 w-12 align-middle shadow-md">
		<i class="bx bx-arrow-back text-2xl"></i>
	</button>
	<div class="px-10">
		<h2 class="h2 text-primary-200">Solicitud pendiente {current?.id}</h2>
		<p class="text-xl">
			Producto: {current?.product.desc}
		</p>
		<p class="text-xl">
			Cantidad producida: {current?.initial_amount} Kg de
		</p>
		<dl class="list-dl">
			{#each current?.used_batches ?? [] as { ingredient_name, ingredient_unit, amount_used_to_produce_batch, batch_code }}
				<div>
					<span class="badge p-2 bg-surface-500"><IconPaperBag /></span>
					<span class="flex-auto">
						<dt class="text-l">
							{amount_used_to_produce_batch}
							{ingredient_unit} de {ingredient_name}
						</dt>
						<dd class="opacity-50">Lote : {batch_code}</dd>
					</span>
				</div>
			{/each}
		</dl>

		<h3 class="h3 pt-4">Finalizar produccion</h3>
		<form class="flex flex-col" method="post" action="?/finish" use:enhance>
			<div class="mb-4">
				<label class="label" for="loss">Ajuste:</label>
				<div>
					<input
						type="number"
						class="input w-40 mr-2"
						id="adjustment"
						bind:value={$form.adjustment}
						class:error_border={$errors.adjustment}
					/>
					<span>Kg</span>
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
							$cancel_form.batch_id = current?.id; // other from reset this
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

