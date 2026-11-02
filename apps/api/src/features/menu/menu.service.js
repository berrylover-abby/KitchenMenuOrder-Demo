export function createMenuService(menuRepository) {
  return {
    async listMenu() {
      return { currency: 'CAD', items: await menuRepository.findAll() };
    },
  };
}
