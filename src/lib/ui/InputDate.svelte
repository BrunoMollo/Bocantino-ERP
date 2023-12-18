<script lang="ts">
	import { writable } from 'svelte/store';
	import { isValidDate } from '$lib/utils';

	export let delimiter = '-';
	export let className = '';
	export let value = '';

	const valueStore = writable('');
	let prevValue = '';
	valueStore.subscribe((val) => {
		if (val.length < 10) {
			value = '';
		}
		if (val.length < prevValue.length) {
			if (val.length == 2 || val.length == 5) {
				$valueStore = val.substring(0, val.length - 1);
			}
			prevValue = val;
			return;
		}
		prevValue = val;

		if (val.length == 2 && val.split(delimiter).length == 1) {
			$valueStore = val + delimiter;
		}
		if (val.length == 5 && val.split(delimiter).length == 2) {
			$valueStore = val + delimiter;
		}

		if (val.length == 10) {
			const [day, month, year] = val.split(delimiter);
			if (isValidDate(day, month, year)) {
				value = `${year}-${month}-${day}`;
			}
		}
	});
</script>

<input
	class={className}
	type="text"
	pattern={`\\d{2}${delimiter}\\d{2}${delimiter}\\d{4}`}
	minlength="10"
	maxlength="10"
	placeholder="dd{delimiter}mm{delimiter}yyyy"
	bind:value={$valueStore}
	on:keypress={(e) => {
		const num = Number(e.key);
		if (Number.isNaN(num)) e.preventDefault();
	}}
/>
