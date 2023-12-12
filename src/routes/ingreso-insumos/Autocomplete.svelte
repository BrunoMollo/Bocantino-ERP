<script lang="ts">
	import {
		Autocomplete,
		popup,
		type AutocompleteOption,
		type PopupSettings
	} from '@skeletonlabs/skeleton';

	export let value;
	export let name: string;

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
		placement: 'bottom'
	};

	let label = '';
	function onFlavorSelection(event: CustomEvent<AutocompleteOption<string>>): void {
		label = event.detail.label;
		value = event.detail.value;
	}
</script>

<input
	class="input autocomplete mb-0"
	type="search"
	{name}
	bind:value={label}
	placeholder="Buscar..."
	use:popup={popupSettings}
/>
<div data-popup={name} class="card w-1/6">
	<Autocomplete bind:input={label} {options} on:selection={onFlavorSelection} emptyState=":(" />
</div>
