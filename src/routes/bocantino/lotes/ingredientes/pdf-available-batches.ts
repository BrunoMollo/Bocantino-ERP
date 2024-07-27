import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function printAvailableBatches(
	batches: {
		id: number;
		batch_code: string;
		stock: number;
		used_batches: {
			batch_code: string;
		}[];
		ingredient: {
			name: string;
			unit: string;
		};
	}[],
	filters: {
		ingredient_name: string;
		batch_code: string;
	}
) {
	const fechaHoy = new Date();
	const fechaFormateada = fechaHoy.toLocaleDateString('es');
	const doc = new jsPDF();
	doc.text('Listado de Lotes', 10, 10);
	doc.text(fechaFormateada, 170, 10);
	doc.setLineWidth(0.75);
	doc.line(10, 13, 200, 13);
	doc.text('Filtro de ingrediente: ' + (filters.ingredient_name || '<NO APLICA>'), 10, 30);
	doc.text('Filtro de codigo de lote: ' + (filters.batch_code || '<NO APLICA>'), 10, 38);

	autoTable(doc, {
		styles: {
			fontSize: 12,
			lineWidth: 0.5,
			lineColor: '#000'
		},

		margin: { top: 50 },

		head: [['Id', 'Codigo', 'Ingrediente', 'Stock', 'Fabricado con', 'Check']],
		body: batches.map((x) => {
			const used = x.used_batches.map((x) => x.batch_code).join(',') || '-';
			const amount = x.stock + ' ' + x.ingredient.unit;
			return [x.id, x.batch_code, x.ingredient.name, amount, used, ' '];
		})
	});
	doc.text('©' + fechaHoy.getFullYear() + 'BOCANTINO. Todos los derechos reservados.', 10, 290);
	doc.autoPrint({ variant: 'non-conform' });
	doc.save('Lotes Disponibles' + fechaFormateada + '.pdf');
}
