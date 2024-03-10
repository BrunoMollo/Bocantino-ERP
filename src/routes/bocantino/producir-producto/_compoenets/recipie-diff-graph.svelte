<script lang="ts">
	import type { NutritionalInfo } from '$logic/nutricional-information-service';
	import { onMount } from 'svelte';
	import ApexCharts, { type ApexOptions } from 'apexcharts';
	import { arraify_nutritional_info, name_nutrient } from '$lib/utils';

	export let base: NutritionalInfo;
	export let modified: NutritionalInfo;

	$: data = arraify_nutritional_info(base).map(({ identifier, amount }) => ({
		x: name_nutrient(identifier),
		y: [amount, modified[identifier]]
	}));
	const options: ApexOptions = {
		series: [],
		chart: {
			height: 500,
			type: 'rangeBar',
			zoom: {
				enabled: true
			}
		},
		plotOptions: {
			bar: {
				isDumbbell: true,
				columnWidth: 6,
				dumbbellColors: [['#ff0000', '#00bb00']]
			}
		},
		grid: {
			xaxis: {
				lines: {
					show: true
				}
			},
			yaxis: {
				lines: {
					show: false
				}
			}
		},
		xaxis: {
			tickPlacement: 'on'
		}
	};

	let chart: ApexCharts | null = null;
	onMount(() => {
		chart = new ApexCharts(document.querySelector('#chart'), options);
		chart.render();
	});

	let first = true;
	$: if (first) {
		first = false;
	} else {
		setTimeout(() => {
			chart?.updateSeries(
				[
					{
						type: 'rangeBar',
						data
					}
				],
				false
			);
		}, 150);
	}
</script>

<div id="chart" class="bg-white" />
