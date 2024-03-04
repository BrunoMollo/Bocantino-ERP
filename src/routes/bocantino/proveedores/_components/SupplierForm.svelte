<script lang="ts">
	import Spinner from '$lib/ui/Spinner.svelte';
	import { fade } from 'svelte/transition';
	import { superForm } from 'sveltekit-superforms/client';
	import type { SupplierSchema } from './shared';
	import type { suppliers_service } from '$logic/suppliers-service';
	import { startAs } from '$lib/utils';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	export let data: { form: any };
	export let supplier: Awaited<ReturnType<typeof suppliers_service.getById>> = undefined;
	export let ingridientsAvailables: { id: number; name: string }[];
	const { form, enhance, errors, delayed } = superForm<SupplierSchema>(data.form, {
		onError: ({ result }) => alert(`ERROR: ${result.error.message}`),
		dataType: 'json',
		clearOnSubmit: 'none'
	});

	if (supplier) {
		startAs(form, 'name', supplier.name);
		startAs(form, 'cuit', supplier.cuit);
		startAs(form, 'phone_number', supplier.phone_number);
		startAs(form, 'contact_person', supplier.contact_person);
		startAs(form, 'comment', supplier.comment);
		startAs(form, 'address', supplier.address);
		startAs(form, 'email', supplier.email);
		startAs(
			form,
			'ingredientsIds',
			supplier.ingredients.map((x) => x.ingredient_id)
		);
	}

	export let btnMsj = 'Agregar';
</script>

<form class="flex flex-col gap-4 p-9" action="" method="post" use:enhance>
	<label for="name" class="label">
		<span>
			Razon social:
			{#if $errors.name}
				<b class=" text-error-400" transition:fade>{$errors.name}</b>
			{/if}
		</span>
		<input
			class="input {$errors.name ? 'input-error' : ''}"
			name="name"
			type="text"
			id="name"
			bind:value={$form.name}
		/>
	</label>
	<label for="contact_person" class="label">
		<span>
			Persona de contacto:
			{#if $errors.contact_person}
				<b class=" text-error-400" transition:fade>{$errors.contact_person}</b>
			{/if}
		</span>
		<input
			class="input {$errors.contact_person ? 'input-error' : ''}"
			name="contact_person"
			type="text"
			id="contact_person"
			bind:value={$form.contact_person}
		/>
	</label>
	<!--Cuit-->
	<label for="cuit" class="label">
		<span>
			Cuit:
			{#if $errors.cuit}
				<b class=" text-error-400" transition:fade>{$errors.cuit}</b>
			{/if}
		</span>
		<input class="input {$errors.cuit ? 'input-error' : ''}" bind:value={$form.cuit} />
	</label>

	<!--phone_number(Opcional)-->
	<label for="phone_number" class="label">
		<span>
			Teléfono:
			{#if $errors.phone_number}
				<b class=" text-error-400" transition:fade>{$errors.phone_number}</b>
			{/if}
		</span>
		<input
			type="tel"
			class="input {$errors.phone_number ? 'input-error' : ''}"
			bind:value={$form.phone_number}
		/>
	</label>
	<!--address-->
	<label for="address" class="label">
		<span>
			Dirección:
			{#if $errors.address}
				<b class=" text-error-400" transition:fade>{$errors.address}</b>
			{/if}
		</span>
		<input class="input {$errors.address ? 'input-error' : ''}" bind:value={$form.address} />
	</label>

	<label for="email" class="label">
		<span>
			Email:
			{#if $errors.email}
				<b class=" text-error-400" transition:fade>{$errors.email}</b>
			{/if}
		</span>
		<input class="input {$errors.email ? 'input-error' : ''}" bind:value={$form.email} />
	</label>
	<label for="comment" class="label">
		<span>
			Comentario:
			{#if $errors.comment}
				<b class=" text-error-400" transition:fade>{$errors.comment}</b>
			{/if}
		</span>
		<textarea
			rows="4"
			cols="40"
			style="resize: none"
			class=" input {$errors.comment ? 'input-error' : ''}"
			bind:value={$form.comment}
		/>
	</label>

	<div class="space-y-1">
		<span>Ingredientes que provee:</span>

		{#each ingridientsAvailables as { id, name }}
			<label class="flex items-center space-x-2">
				<input class="checkbox" type="checkbox" value={id} bind:group={$form.ingredientsIds} />
				<p>{name}</p>
			</label>
		{/each}
	</div>

	<button class="btn variant-filled-primary" type="submit">
		<b>{btnMsj}</b>
		<Spinner showIf={$delayed} size={4} />
	</button>
</form>
