<script lang="ts">
	import { onMount } from 'svelte';
	import ApexCharts, { type ApexOptions } from 'apexcharts';
	import {
		arraify_nutritional_info,
		name_nutrient,
		type NutritionalInfo
	} from '$lib/nutrients-utils';

	export let base: NutritionalInfo;
	export let modified: NutritionalInfo;

	$: data = arraify_nutritional_info(base).map(({ identifier, amount }) => ({
		x: name_nutrient(identifier),
		y: [amount, modified[identifier]]
	}));

	const colorsPoints = ['#444444', '#0044ee'];
	const options: ApexOptions = {
		series: [],
		chart: {
			height: 600,
			type: 'rangeBar',
			zoom: {
				enabled: false
			}
		},
		plotOptions: {
			bar: {
				isDumbbell: true,
				columnWidth: 6,
				dumbbellColors: [colorsPoints]
			}
		},
		fill: {
			type: 'gradient',
			gradient: {
				type: 'vertical',
				gradientToColors: colorsPoints,
				inverseColors: false
			}
		},
		legend: {
			show: true,
			showForSingleSeries: true,
			position: 'top',
			horizontalAlign: 'left',
			customLegendItems: ['Original', 'Modificado'],
			labels: {
				colors: colorsPoints,
				useSeriesColors: false
			},
			markers: {
				fillColors: colorsPoints
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

<div id="chart" class="bg-white text-[#666666]" />
