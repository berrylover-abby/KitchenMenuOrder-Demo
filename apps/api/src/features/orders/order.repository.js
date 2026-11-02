export function createOrderRepository() {
  const orders = new Map();
  return {
    async save(order) {
      if (orders.has(order.id)) throw new Error('Order ID already exists.');
      orders.set(order.id, structuredClone(order));
      return structuredClone(order);
    },
    async findAll() { return structuredClone([...orders.values()]); },
    async findById(id) { return structuredClone(orders.get(id) || null); },
    async updateStatus(id, status) {
      const order = orders.get(id);
      if (!order) return null;
      const updated = { ...order, status };
      orders.set(id, updated);
      return structuredClone(updated);
    },
  };
}
