import { jsPDF } from 'jspdf';
import { derived, type Writable } from 'svelte/store';

export function printBatchLabel(
	batch: {
		batch_code: string;
		initial_amount: number;
		production_date: Date;
		expiration_date: Date;
		ingredient_id: number;
		number_of_bags: number;
	},
	ingredients: Array<{
		id: number;
		name: string;
	}>
) {
	const this_year = new Date().getFullYear();
	const doc = new jsPDF({
		orientation: 'landscape',
		unit: 'mm',
		format: [80, 50]
	});

	const ingredient_name = ingredients.find((x) => x.id === batch.ingredient_id)?.name;
	const production_date = format_date(batch.production_date);
	const expiration_date = format_date(batch.expiration_date);
	const { batch_code, initial_amount, number_of_bags } = batch;

	doc.setFontSize(8);
	doc.text('Materia prima: ' + (ingredient_name ?? '[[ERROR: Ingrediente no encontrado]]'), 5, 5);
	doc.text('Fechas:', 5, 11);
	doc.text('Produccion: ' + production_date, 25, 11);
	doc.text('Vencimiento: ' + expiration_date, 25, 15);
	doc.setFontSize(13);
	doc.text('Codigo Lote ' + batch_code, 3, 30);
	doc.setFontSize(8);
	doc.text('Cantidad: ' + initial_amount / number_of_bags + 'Kg', 5, 37);
	doc.line(5, 40, 75, 40);
	doc.text('© ' + this_year + ' BOCANTINO. Todos los derechos reservados.', 5, 45);
	doc.autoPrint({ variant: 'non-conform' });
	doc.save('Etiqueta' + batch_code);
}

function format_date(date: Date | string) {
	return new Date(date).toLocaleDateString('es');
}

/*
 * This function builds a store that returns a function that takes an index and returns true/false
 * whether the batch[index] has all the data to print a label
 * */
export function derive_if_can_print_label(form: Writable<{ batches: Record<string, unknown>[] }>) {
	return derived(
		derived(form, (f) => f.batches),
		($batches) => (index: number) => {
			return (
				!$batches[index].ingredient_id ||
				!$batches[index].initial_amount ||
				!$batches[index].number_of_bags ||
				!$batches[index].production_date ||
				!$batches[index].expiration_date ||
				!$batches[index].batch_code
			);
		}
	);
}
