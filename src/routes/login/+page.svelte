<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';

	export let data;
	const { form, enhance, errors, delayed } = superForm(data.form);
</script>

<div class="w-full h-full flex items-center">
	<div class="card md:w-5/12 pb-14 m-auto pt-10 rounded-lg p-3 shadow-2xl">
		<h1 class=" text-5xl uppercase text-center">Bocantino</h1>
		<form action="" method="post" class="form" use:enhance>
			<div class="w-2/3 mx-auto mt-10">
				<p>Usuario:</p>
				<input
					type="text"
					class="input w-full"
					class:error_border={$errors.username}
					name="username"
					bind:value={$form.username}
				/>
			</div>
			<div class="w-2/3 mx-auto mt-5">
				<p>Password:</p>
				<input
					type="text"
					class="input w-full"
					class:error_border={$errors.password}
					name="password"
					bind:value={$form.password}
				/>
			</div>
			<div class="w-2/3 mx-auto flex justify-end mt-7">
				<button type="submit" class="btn variant-filled w-32 rounded">
					{#if $delayed}
						.....
					{:else}
						Iniciar sesion
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>

