import { deletebyID } from "$lib/server/logic/ingredients";
import type { RequestHandler } from "@sveltejs/kit";
import { read } from "fs";

export const POST: RequestHandler = async (p) => {
    if (p.params.id != undefined) {
        const id: number = Number(p.params.id);
        await deletebyID(id);
    }
    return new Response()
}