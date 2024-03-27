<script lang="ts">
	import {
		Autocomplete,
		popup,
		type AutocompleteOption,
		type PopupSettings
	} from '@skeletonlabs/skeleton';
	import { writable } from 'svelte/store';

	export let id = '';
	export let value;
	export let name: string;
	export let className = '';
	export let placeholder = 'Buscar...';

	export let labels: string[];
	export let values: (number | string)[];

	const options: AutocompleteOption<string, number>[] = [];
	for (let i = 0; i < labels.length; i++) {
		options.push({
			label: labels[i],
			value: values[i].toString()
		});
	}

	let popupSettings: PopupSettings = {
		event: 'focus-click',
		target: name,
		placement: 'bottom-start'
	};

	let label = writable('');
	let selectedLabel = '';
	label.subscribe((lab) => {
		if (lab !== selectedLabel) {
			value = 0;
		}
	});

	function onFlavorSelection(event: CustomEvent<AutocompleteOption<string>>): void {
		$label = event.detail.label;
		selectedLabel = $label;
		value = event.detail.value;
	}
</script>

<input
	{id}
	class={`input autocomplete mb-0 ${className}`}
	type="search"
	bind:value={$label}
	{placeholder}
	use:popup={popupSettings}
	autocomplete="off"
/>
<div data-popup={name} class="card w-1/6 z-50 pt-0 mt-0 truncate">
	<Autocomplete bind:input={$label} {options} on:selection={onFlavorSelection} emptyState=":(" />
</div>
