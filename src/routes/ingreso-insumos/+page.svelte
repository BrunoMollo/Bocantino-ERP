<script lang="ts">
	import Autocomplete from './Autocomplete.svelte';
	import {  fly } from 'svelte/transition';
	import { superForm } from 'sveltekit-superforms/client';
	import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
	export let data;
	const { EMPTY_BAG } = data;
	const { form } = superForm(data.form, { dataType: 'json' });

	function addLine() {
		form.update((f) => {
			f.bags.push(EMPTY_BAG);
			return f;
		});
	}

	function removeLine(index: number) {
		form.update((f) => {
			if (f.bags.length > 1) {
				//@ts-ignore
				f.bags = f.bags.filter((_, i) => i !== index);
			}
			return f;
		});
	}
</script>

<form action="" method="post">
	<div class="table-container w-11/12 shadow-lg rounded-lg">
		<table class="table">
			<thead>
				<tr>
					<th>Proveedor</th>
					<th>Materia Prima</th>
					<th>Cantidad</th>
					<th>Codigo</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each $form.bags as _, i}
					<tr transition:fly={{ x: -350 }}>
						<td>
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<label class="label">
								<Autocomplete
									name="supplierId-{i}"
									bind:value={$form.bags[i].supplierId}
									labels={['Juan', 'Pedro', 'Martidsdsadan']}
									values={[1, 2, 3]}
								/>
							</label>
						</td>

						<td>
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<label class="label">
								<Autocomplete
									name="ingredientId-{i}"
									bind:value={$form.bags[i].ingredientId}
									labels={['Zapallo', 'Papa', 'Huevo']}
									values={[1, 2, 3]}
								/>
							</label>
						</td>
						<td>
							<input class="input" type="text" bind:value={$form.bags[i].fullAmount} />
						</td>
						<td>
							<div class="input-group input-group-divider grid-cols-[auto_auto] w-70">
								<input type="text" bind:value={$form.bags[i].supplier_batch_code} />
								<button type="button" class="variant-filled-surface">Autogenerar</button>
							</div>
						</td>
						<td>
							<button
								type="button"
								class="btn-icon btn-icon-sm variant-soft-secondary"
								disabled={$form.bags.length === 1}
								on:click={() => removeLine(i)}
							>
								<i class="bx bxs-trash place-self-center text-xl" />
							</button>
						</td>
					</tr>
				{/each}
				<button type="button" class="btn variant-filled" on:click={addLine}>Agregar Renglon</button>
			</tbody>
		</table>
	</div>
	<button type="submit" class="btn variant-filled-secondary">Enviar</button>
</form>

<br /><br />
<SuperDebug data={$form} />
