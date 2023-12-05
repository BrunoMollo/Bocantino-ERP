import type { PageServerLoad } from "./$types";
import { db } from "$lib";
import { tipoMateriaPrima } from "$lib/server/schema";

export const load: PageServerLoad = async ({ }) => {
	const list = await db.select().from(tipoMateriaPrima)
	return { list }
}
