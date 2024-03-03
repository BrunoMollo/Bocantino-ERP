<script lang="ts">
	import { writable } from 'svelte/store';

	export let id = '';
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
			const [dayNum, monthNum, yearNum] = val.split(delimiter).map((x) => Number(x));

			if (dayNum < 1 || monthNum < 1 || yearNum < 1) {
				return;
			}

			const date = new Date(yearNum, monthNum - 1, dayNum);

			if (
				date.getFullYear() === yearNum &&
				date.getMonth() === monthNum - 1 &&
				date.getDate() === dayNum
			) {
				const [day, month, year] = val.split(delimiter);
				value = `${year}-${month}-${day}`;
			}
		}
	});
</script>

<input
	{id}
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

