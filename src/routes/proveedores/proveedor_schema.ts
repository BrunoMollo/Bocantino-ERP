import {z} from 'zod';

export const proveedor = z.object({
    name: z.string().min(4, 'El nombre del proveedor no puede ser menor a 4 caracteres').max(128, 'El nombre del proveedor no puede ser mayor a 128 caracteres'),
    email: z.string().email(),
    materiasPrimas: z.array(z.number())
})
