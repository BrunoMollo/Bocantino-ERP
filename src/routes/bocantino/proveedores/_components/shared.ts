import { superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';

export const supplier_schema = z.object({
	name: z.string().min(3, 'muy corto').max(255),
	contact_person: z.string().min(3, 'muy corto').max(255),
	email: z.string().email('email invalido'),
	cuit: z.string().min(9, 'Cuit invalido'),
	phone_number: z.string(),
	address: z.string(),
	comment: z.string().max(255, 'comentario muy largo'),
	ingredientsIds: z.coerce.number().positive().array().default([])
});

export type SupplierSchema = typeof supplier_schema;

export function createForm(value?: { name: string; email: string; ingredients: { id: number }[] }) {
	if (value) {
		return superValidate(value, supplier_schema);
	} else {
		return superValidate(supplier_schema);

	}
}
