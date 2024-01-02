import type { PageServerLoad } from "./ingreso-insumos/$types";
import { db } from '$lib/server/db';
import { t_ingredient } from "$lib/server/db/schema";



export const ssr = false;
export const load: PageServerLoad = async () => {
    const tiposMP = await db.select().from(t_ingredient)
};
// Todo terminar esta consulta sql, debe retornar las materias primas y calcular el stock real de las mismas.