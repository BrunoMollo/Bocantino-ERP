import { product_service } from "$logic/product-service";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "../$types";

export const load: PageServerLoad = async (url) => {
    //@ts-ignore
    const id = url.params.id;
    const product = await product_service.getProductBatchByID(id);
    if (!product) {
        throw error(400, 'id invalido');
    }
    return { product }
}