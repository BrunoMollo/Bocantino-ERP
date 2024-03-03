<script lang="ts">
	import type { NutritionalInfo } from '$logic/nutricional-information-service';
	import { onMount } from 'svelte';
	import ApexCharts, { type ApexOptions } from 'apexcharts';

	export let base: NutritionalInfo;
	export let modified: NutritionalInfo;
	var options: ApexOptions = {
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
						data: [
							{
								x: 'grasa',
								y: [base.nutrient_fat, modified.nutrient_fat]
							},
							{
								x: 'proteina',
								y: [base.nutrient_protein, modified.nutrient_protein]
							},
							{
								x: 'carboidratos',
								y: [base.nutrient_carb, modified.nutrient_carb]
							}
						]
					}
				],
				false
			);
		}, 150);
	}
</script>

<div id="chart" class="bg-white" />
