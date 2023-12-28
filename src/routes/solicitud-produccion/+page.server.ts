import { db } from '$lib/server/db';
import { t_ingredient, tr_ingredient_ingredient } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';

interface seleccionLote {
	identificador: String;
	cantidadDisponible: Number;
	cantidad: Number;
}

interface Fila {
	materiaPrima: string;
	lotes: seleccionLote[];
	faltante: number;
}
const nuevaFila: Fila = {
	materiaPrima: '',
	lotes: [],
	faltante: 0
};

let filas: Fila[];
const ingredinetProduction_schema = z.object({
	ingredeintId: z.coerce.number().int().positive(),
	producedAmount: z.coerce.number().positive()
});

export const load: PageServerLoad = async () => {
	const form = superValidate(ingredinetProduction_schema);
	const ingredients = await db
		.select({
			id: t_ingredient.id,
			name: t_ingredient.name,
			unit: t_ingredient.unit,
			derivedId: tr_ingredient_ingredient.derivedId,
			amount: tr_ingredient_ingredient.amount
		})
		.from(tr_ingredient_ingredient)
		.innerJoin(t_ingredient, eq(t_ingredient.id, tr_ingredient_ingredient.derivedId));
	return { form, ingredients };
};

