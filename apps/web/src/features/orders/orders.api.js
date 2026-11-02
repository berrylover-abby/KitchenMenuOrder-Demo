import { request } from '../../shared/api/client.js';

export async function fetchOrderStatus(id) {
  const data = await request(`/orders/${encodeURIComponent(id)}/status`, { cache: 'no-store' });
  if (data.id !== id || !['New', 'Completed'].includes(data.status)) {
    throw new Error('The server returned an invalid order status.');
  }
  return { id: data.id, status: data.status };
}

export async function fetchOrders() {
  const data = await request('/orders', { cache: 'no-store' });
  if (!Array.isArray(data.orders)) throw new Error('The server returned an invalid order list.');
  return data.orders.map(mapOrder);
}

function mapOrder(order) {
    if (!order || typeof order.id !== 'string' || !order.id ||
        typeof order.customerName !== 'string' || order.currency !== 'CAD' ||
        !Number.isSafeInteger(order.subtotalCents) || order.subtotalCents < 0 ||
        typeof order.submittedAt !== 'string' || !Number.isFinite(Date.parse(order.submittedAt)) ||
        !['New', 'Completed'].includes(order.status) ||
        !Array.isArray(order.items) || !order.items.length) {
      throw new Error('The server returned an invalid order.');
    }
    const items = order.items.map((item) => {
      if (!item || typeof item.itemId !== 'string' || typeof item.name !== 'string' ||
          !Number.isSafeInteger(item.quantity) || item.quantity <= 0 ||
          !Number.isSafeInteger(item.lineTotalCents) || item.lineTotalCents < 0) {
        throw new Error('The server returned an invalid order item.');
      }
      return { itemId: item.itemId, name: item.name, quantity: item.quantity, lineTotalCents: item.lineTotalCents };
    });
    return {
      id: order.id, customerName: order.customerName, subtotalCents: order.subtotalCents,
      submittedAt: order.submittedAt, status: order.status, items,
    };
}

export async function completeOrder(id) {
  return mapOrder(await request(`/orders/${encodeURIComponent(id)}/status`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'Completed' }),
  }));
}

export async function submitOrder(order) {
  const data = await request('/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: order.customerName,
      items: order.items.map(({ itemId, quantity }) => ({ itemId, quantity })),
    }),
  });
  if (typeof data.id !== 'string' || !data.id || typeof data.customerName !== 'string' ||
      data.currency !== 'CAD' || !Number.isSafeInteger(data.subtotalCents) || data.subtotalCents < 0) {
    throw new Error('The server returned an invalid order confirmation.');
  }
  return { id: data.id, customerName: data.customerName, subtotalCents: data.subtotalCents };
}
