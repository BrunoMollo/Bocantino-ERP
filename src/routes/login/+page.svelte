<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import Loader from '../bocantino/_components/Loader.svelte';

	export let data;
	const { form, enhance, errors, delayed, message } = superForm(data.form, {
		taintedMessage: null
	});
</script>

<div class="w-full h-full flex items-center">
	<div class="card md:w-5/12 pb-14 m-auto pt-10 rounded-lg p-3 shadow-2xl">
		<h1 class=" text-5xl uppercase text-center">Bocantino</h1>
		{#if $message}
			<div class="w-full flex flex-col items-center pt-10">
				<aside class="w-8/12 alert variant-filled-error">
					<div><i class="bx bx-error text-white text-6xl"></i></div>
					<div class="alert-message">
						<h3 class="h3">Error</h3>
						<p>{$message}</p>
					</div>
				</aside>
			</div>
		{/if}
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
			<div class="w-2/3 mx-auto mt-5 relative">
				<p>Password:</p>
				<input
					type="password"
					class="input w-full"
					class:error_border={$errors.password}
					name="password"
					bind:value={$form.password}
				/>
			</div>
			<div class="w-2/3 mx-auto justify-around flex mt-7">
				{#if $delayed}
					<div class="mx-a">
						<Loader />
					</div>
				{:else}
					<button type="submit" class="btn variant-filled w-32 rounded">Iniciar sesion</button>
				{/if}
			</div>
		</form>
	</div>
</div>
