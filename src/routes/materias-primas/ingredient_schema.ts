import { z } from 'zod';

export const VALID_UNITS = ['Litros', 'Mililitros', 'Gramos', 'KiloGramos'] as const;

export const ingredient_schema = z.object({
	name: z.string().min(2, 'demasiado corto').max(255, 'demaiado largo'),
	unit: z.enum(VALID_UNITS)
});
