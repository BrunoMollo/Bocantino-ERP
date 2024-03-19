<script lang="ts">
	export let showModal: boolean;

	let dialog: HTMLDialogElement;

	$: if (dialog && showModal) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
	class=" bg-slate-300 h-1/3"
	bind:this={dialog}
	on:close={() => (showModal = false)}
	on:click|self={() => dialog.close()}
>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="grid gap-5" on:click|stopPropagation>
		<slot name="header" />
		<hr />

		<li class="my-2" style="list-style: none;">Seguro que desea eliminar el ingreso de insumo?</li>
		<div class="flex gap-3 justify-center mb-4">
			<slot />
			<!-- svelte-ignore a11y-autofocus -->
			<button
				class="h-fit variant-filled-primary px-4 py-2 rounded-md"
				autofocus
				on:click={() => dialog.close()}>Cancelar</button
			>
		</div>
		<hr />
	</div>
</dialog>

<style>
	dialog {
		max-width: 32em;
		box-shadow: 0 8px 12px rgba(0, 0, 0, 0.5);
		border-radius: 10px;
		border: none;
		padding: 0;
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.5);
	}
	dialog > div {
		padding: 1em;
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.8);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	button {
		display: block;
	}
</style>
