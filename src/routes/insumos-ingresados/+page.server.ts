import { db } from "$lib/server/db";
import { t_ingredient_batch, t_ingridient_entry } from "$lib/server/db/schema";
import { on } from "events";
import type { PageServerLoad } from "./$types";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async () => {
    const entries = await db.select({ id: t_ingridient_entry.id })
        .from(t_ingridient_entry)
        .innerJoin(t_ingredient_batch, eq(t_ingredient_batch.id, t_ingridient_entry.id))
}