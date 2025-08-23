import { jsPDF } from 'jspdf';
import { derived, type Writable } from 'svelte/store';

// Unified interface for batch data
interface BatchLabelData {
	batch_code: string;
	ingredient_name: string;
	amount: number;
	production_date: Date | string;
	expiration_date: Date | string;
	amount_per_bag?: number;
}

// Unified function to generate batch labels
function generateBatchLabel(data: BatchLabelData, filename: string) {
	const this_year = new Date().getFullYear();
	const doc = new jsPDF({
		orientation: 'landscape',
		unit: 'mm',
		format: [80, 50] 
	});

	const pageWidth = doc.internal.pageSize.getWidth();
	const pageHeight = doc.internal.pageSize.getHeight();
	const margin = 5;

	const production_date = format_date(data.production_date);
	const expiration_date = format_date(data.expiration_date);
	const display_amount = data.amount_per_bag ? `${data.amount_per_bag} Kg` : `${data.amount} Kg`;

	doc.setFont('helvetica', 'normal');
	doc.setFontSize(10);
	doc.text('Lote: ' + data.batch_code, margin, margin + 2);
	doc.text('Cantidad: ' + display_amount, margin, 12);
	doc.setLineWidth(0.2);
	doc.line(margin, margin + 10, pageWidth - margin, margin + 10);

	doc.setFont('helvetica', 'bold');
	doc.setFontSize(12);
	doc.text('Materia prima: ' + data.ingredient_name, pageWidth / 2, pageHeight / 2, {
		align: 'center',
		baseline: 'middle'
	});

	doc.setFont('helvetica', 'normal');
	doc.setFontSize(9);
	const dateYPosition = pageHeight - margin - 8;
	doc.text('Producción: ' + production_date, margin, dateYPosition);
	doc.text('Vencimiento: ' + expiration_date, pageWidth - margin, dateYPosition, { align: 'right' });

	doc.setFontSize(7);
	doc.text('© ' + this_year + ' BOCANTINO. Todos los derechos reservados.', margin, pageHeight - margin);

	doc.autoPrint({ variant: 'non-conform' });
	doc.save(filename);
	return null;
}

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
	const ingredient_name = ingredients.find((x) => x.id === batch.ingredient_id)?.name || 'N/A';
	const amount_per_bag = (batch.initial_amount / batch.number_of_bags).toFixed(2);

	return generateBatchLabel({
		batch_code: batch.batch_code,
		ingredient_name,
		amount: batch.initial_amount,
		production_date: batch.production_date,
		expiration_date: batch.expiration_date,
		amount_per_bag: parseFloat(amount_per_bag)
	}, 'Etiqueta-' + batch.batch_code);
}

function format_date(date: Date | string) {
	return new Date(date).toLocaleDateString('es');
}

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

export function printIngredientBatchLabel(
	batch: {
		id: number;
		batch_code: string;
		initial_amount: number;
		state: "IN_PRODUCTION" | "AVAILABLE" | "EMPTY";
		expiration_date: Date | null;
		production_date: Date | null;
		current_amount: number;
		ingredient: {
			id: number;
			name: string;
			unit: "gr" | "Kg";
		}
	}
) {
	if(batch.production_date == null) return;
	
	let expiration_date = batch.expiration_date;
	if(expiration_date == null) { 
		expiration_date = new Date(batch.production_date);
		expiration_date.setFullYear(batch.production_date.getFullYear() + 1);
	}

	return generateBatchLabel({
		batch_code: batch.batch_code,
		ingredient_name: batch.ingredient.name,
		amount: batch.current_amount,
		production_date: batch.production_date,
		expiration_date
	}, 'Etiqueta-' + batch.batch_code);
}

export function printBatchLabelFromDetail(
	batch : {
    id: number;
    code: string;
    ingredient: string;
    initial_amount: number;
    production_date: string | null;
    expiration_date: string | null;
    cost: number | null;
    iva_tax_percentage: number;
    withdrawal_tax_amount: number;
    bags: number; }
){
	if(batch.production_date == null) return;
	
	let expiration_date = batch.expiration_date;
	if(expiration_date == null) {
		expiration_date = sumarMesesAFecha(batch.production_date, 12);
	}

	const amount_per_bag = (batch.initial_amount / batch.bags).toFixed(2);

	return generateBatchLabel({
		batch_code: batch.code,
		ingredient_name: batch.ingredient,
		amount: batch.initial_amount,
		production_date: batch.production_date,
		expiration_date,
		amount_per_bag: parseFloat(amount_per_bag)
	}, 'Etiqueta-' + batch.code);
}

function sumarMesesAFecha(dateString: string, monthsToAdd: number) {
    const parts = dateString.split('/');
    if (parts.length !== 3) {
        throw new Error("El formato de la fecha debe ser DD/MM/YYYY");
    }

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    const date = new Date(year, month, day);

    date.setMonth(date.getMonth() + monthsToAdd);

    const newDay = String(date.getDate()).padStart(2, '0');
    const newMonth = String(date.getMonth() + 1).padStart(2, '0')
    const newYear = date.getFullYear();

    return `${newDay}/${newMonth}/${newYear}`;
}