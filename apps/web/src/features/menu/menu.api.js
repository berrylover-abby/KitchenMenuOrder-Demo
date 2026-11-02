import { request } from '../../shared/api/client.js';
// Translate the REST contract here. Components consume a frontend menu model.
export async function fetchMenu() {
  const data = await request('/menu');
  if (data.currency !== 'CAD' || !Array.isArray(data.items)) {
    throw new Error('The server returned an invalid menu.');
  }
  return data.items.map((item) => {
    if (typeof item.id !== 'string' || typeof item.name !== 'string' ||
        typeof item.description !== 'string' || typeof item.category !== 'string' ||
        !Number.isSafeInteger(item.priceCents) || item.priceCents < 0) {
      throw new Error('The server returned an invalid menu item.');
    }
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      priceCents: item.priceCents,
      imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : null,
    };
  });
}
