import { jsPDF } from 'jspdf';

export function printBatchLabel(
	information: {
		batch_code: string;
		initial_amount: number;
		production_date: Date;
		expiration_date: Date;
		ingredient_id: number;
		cost: number;
		number_of_bags: number;
	},
	ingredients: Array<{
		id: number;
		name: string;
	}>
) {
	const fechaHoy = new Date();
	const doc = new jsPDF({
		orientation: 'landscape',
		unit: 'mm',
		format: [80, 50]
	});
	doc.setFontSize(8);
	const ingredient_name = ingredients.find((x) => x.id === information.ingredient_id)?.name;
	doc.text('Materia prima: ' + ingredient_name ?? '[[ERROR: Ingrediente no encontrado]]', 5, 5);
	doc.text('Fechas:', 5, 11);
	doc.text('Produccion: ' + information.production_date.toLocaleDateString('es'), 25, 11);
	doc.text('Vencimiento: ' + information.expiration_date.toLocaleDateString('es'), 25, 15);
	doc.setFontSize(13);
	doc.text('Codigo Lote ' + information.batch_code, 3, 30);
	doc.setFontSize(8);
	doc.text('Cantidad: ' + information.initial_amount / information.number_of_bags + 'Kg', 5, 37);
	doc.line(5, 40, 75, 40);
	doc.text('©' + fechaHoy.getFullYear() + 'BOCANTINO. Todos los derechos reservados.', 5, 45);
	doc.autoPrint({ variant: 'non-conform' });
	doc.save('Etiqueta' + information.batch_code);
}
