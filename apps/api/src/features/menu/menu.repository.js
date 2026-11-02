import { menuItems } from './menu.data.js';

export function createMenuRepository(items = menuItems) {
  const menu = structuredClone(items);
  return {
    async findAll() { return structuredClone(menu); },
    async findById(id) { return structuredClone(menu.find((item) => item.id === id)); },
  };
}
