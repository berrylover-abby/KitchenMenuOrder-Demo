import { randomUUID } from 'node:crypto';
import { ValidationError } from '../../shared/validation-error.js';
import { NotFoundError } from '../../shared/not-found-error.js';

export function createOrderService({ menuRepository, orderRepository, createId = randomUUID, now = () => new Date() }) {
  return {
    async getStatus(id) {
      const order = await orderRepository.findById(id);
      if (!order) throw new NotFoundError('Order not found.');
      return { id: order.id, status: order.status };
    },
    async updateStatus(id, input) {
      if (!input || input.status !== 'Completed') {
        throw new ValidationError('Status must be Completed.');
      }
      // Completing an already completed order is safe to repeat.
      const order = await orderRepository.updateStatus(id, 'Completed');
      if (!order) throw new NotFoundError('Order not found.');
      return order;
    },
    async listOrders() {
      const orders = await orderRepository.findAll();
      return orders.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    },
    async createOrder(input) {
      if (!input || typeof input !== 'object' || Array.isArray(input)) {
        throw new ValidationError('An order object is required.');
      }
      if (typeof input.customerName !== 'string' || !input.customerName.trim()) {
        throw new ValidationError('Customer name is required.');
      }
      const customerName = input.customerName.trim();
      if (customerName.length > 100) {
        throw new ValidationError('Customer name must be 100 characters or fewer.');
      }
      if (!Array.isArray(input.items) || input.items.length === 0) {
        throw new ValidationError('Add at least one item to your order.');
      }

      // Normalize repeated IDs so callers cannot bypass aggregate quantity checks.
      const quantities = new Map();
      for (const line of input.items) {
        if (!line || typeof line.itemId !== 'string' || !line.itemId.trim()) {
          throw new ValidationError('Each order item must have an item ID.');
        }
        if (!Number.isSafeInteger(line.quantity) || line.quantity <= 0) {
          throw new ValidationError('Item quantities must be positive safe integers.');
        }
        const quantity = (quantities.get(line.itemId) || 0) + line.quantity;
        if (!Number.isSafeInteger(quantity)) throw new ValidationError('Item quantity is too large.');
        quantities.set(line.itemId, quantity);
      }

      // Read one menu snapshot for consistent pricing within this order.
      const menu = new Map((await menuRepository.findAll()).map((item) => [item.id, item]));
      const items = [];
      let subtotalCents = 0;
      for (const [itemId, quantity] of quantities) {
        const dish = menu.get(itemId);
        if (!dish) throw new ValidationError(`Unknown menu item: ${itemId}.`);
        const lineTotalCents = dish.priceCents * quantity;
        if (!Number.isSafeInteger(lineTotalCents) || !Number.isSafeInteger(subtotalCents + lineTotalCents)) {
          throw new ValidationError('Order total is too large.');
        }
        items.push({ itemId, name: dish.name, priceCents: dish.priceCents, quantity, lineTotalCents });
        subtotalCents += lineTotalCents;
      }

      // Client prices/totals are ignored. Save only after the entire order is valid.
      return orderRepository.save({
        id: createId(), customerName, items, subtotalCents,
        currency: 'CAD', status: 'New', submittedAt: now().toISOString(),
      });
    },
  };
}
