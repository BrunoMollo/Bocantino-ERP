import { z } from 'zod';

export const supplier_schema = z.object({
	name: z.string().min(3, 'muy corto').max(255),
	email: z.string().email('email invalido'),
	ingredients: z.object({ id: z.coerce.number().positive() }).array().default([])
});
