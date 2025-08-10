import { writable } from 'svelte/store';
export const items = writable([
	{ name: 'Producciones pendientes', show: true },
	{ name: 'Últimos ingresos', show: true }
]);
