import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
  const suppliers = [
    {
      id: 0,
      name: 'Proveedor2',
      email: 'Proveedor2@gmail.com',
      ingredients: [{ name: 'Zanahoria' }]
    }
  ];

  return { suppliers };
};
