import { db } from '$lib';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {

  const resultSet = await db.query.t_supplier.findMany({
    with: {
      r_supplier_ingredient: {
        columns: {},
        with: {
          ingredient: true
        }
      }
    }
  })

  const suppliers = resultSet.map(({ id, name, email, r_supplier_ingredient }) => ({
    id, name, email,
    ingredients: r_supplier_ingredient.map(({ ingredient }) => ingredient)
  }))

  return { suppliers };
};
