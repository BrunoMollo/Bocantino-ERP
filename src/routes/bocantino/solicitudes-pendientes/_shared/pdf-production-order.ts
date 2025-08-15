import { jsPDF } from 'jspdf';
import autoTable, { CellHookData } from 'jspdf-autotable';

export function printProductionOrder(
	name: string,
	item: {
		id: number;
		initial_amount: number;
		used_batches: {
			amount_used_to_produce_batch: number;
			batch_code: string;
			ingredient_name: string;
			ingredient_unit: string;
		}[];
	},
	ingredient : boolean = false
) {
	const fechaHoy = new Date();
	const fechaFormateada = fechaHoy.toLocaleDateString('es');
	const doc = new jsPDF();
	doc.text('Solicitud de producción numero: ' + item.id, 10, 10);
	doc.text(fechaFormateada, 170, 10);
	doc.setLineWidth(0.75);
	doc.line(10, 13, 200, 13);
	doc.text('Cantidad a producir: ' + item.initial_amount + ' de ' + name + '.', 10, 23);

	autoTable(doc, {
		styles: {
			fontSize: 12,
			lineWidth: 0.5,
			lineColor: '#000',
			halign: 'center'
		},
		margin: { top: 30 },
		head: [['Ingrediente', 'Número lote', 'Cantidad utilizada', 'Check']],
		body: item.used_batches.map((x) => {
			return [
				x.ingredient_name,
				x.batch_code,
				x.amount_used_to_produce_batch.toString() + ' ' + x.ingredient_unit,
                ''
			];
		})
	});


	let finalY = (doc as any).lastAutoTable.finalY;
	if(ingredient){
		autoTable(doc, {
			styles: {
				fontSize: 12,
				lineWidth: 0.5,
				lineColor: '#000',
				halign: 'center'
			},
			startY: finalY + 10,
			head: [['Antioxidante', 'Gramos', 'Check']],
			body: [['', '', '']],
			didParseCell: (data: CellHookData) => {
				if (data.section === 'head' && data.row.index === 0 && data.column.index === 0) {
					(data.cell as any).rowSpan = 2;
					(data.cell.styles as any).valign = 'middle';
				}
			}
		});

		finalY = (doc as any).lastAutoTable.finalY;

		doc.text('Control de cocción', 105, finalY + 15, { align: 'center' });
		autoTable(doc, {
			styles: {
				fontSize: 12,
				lineWidth: 0.5,
				lineColor: '#000',
				halign: 'center'
			},
			startY: finalY + 20,
			head: [['Hora', 'Temperatura', 'Fin']],
			body: Array(6).fill(['', '', ''])
		});

		finalY = (doc as any).lastAutoTable.finalY;

		const finalFieldsY = finalY + 20;
	}

doc.text('horas de secado:', 125, 255);

doc.line(170, 255, 200, 255);

doc.text('peso neto:', 10, 270);

doc.line(38, 270, 70, 270);

doc.text('Firma responsable:', 120, 270);

doc.line(170, 270, 200, 270);

doc.text('© ' + fechaHoy.getFullYear() + ' BOCANTINO. Todos los derechos reservados.', 10, 290);

doc.autoPrint({ variant: 'non-conform' });

doc.save('Solicitud' + item.id + '.pdf');
return null;
}