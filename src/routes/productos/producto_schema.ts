import { z } from 'zod'

export const producto_schema = z.object({
	desc: z.string().min(4, 'muy corto').max(255, 'muy largo'),
	ingredients: z.array(z.object({
		id: z.coerce.number().positive().int(),
		amount: z.coerce.number().positive('debe ser positivo')
	}))
})



