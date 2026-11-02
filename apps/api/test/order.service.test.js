import test from 'node:test';
import assert from 'node:assert/strict';
import { createMenuRepository } from '../src/features/menu/menu.repository.js';
import { createOrderRepository } from '../src/features/orders/order.repository.js';
import { createOrderService } from '../src/features/orders/order.service.js';
import { ValidationError } from '../src/shared/validation-error.js';

function setup() {
  const orderRepository = createOrderRepository();
  const menuRepository = createMenuRepository();
  const service = createOrderService({
    menuRepository, orderRepository,
    createId: () => 'test-order', now: () => new Date('2026-11-02T12:00:00Z'),
  });
  return { service, orderRepository };
}

test('order service prices from menu, combines duplicates and stores independent snapshots', async () => {
  const { service, orderRepository } = setup();
  const order = await service.createOrder({
    customerName: '  Abby  ', subtotalCents: 1,
    items: [
      { itemId: 'burger', quantity: 1, priceCents: 1 },
      { itemId: 'fries', quantity: 2 },
      { itemId: 'burger', quantity: 1 },
    ],
  });
  assert.equal(order.id, 'test-order');
  assert.equal(order.customerName, 'Abby');
  assert.equal(order.subtotalCents, 3400);
  assert.equal(order.items.length, 2);
  assert.equal(order.items[0].quantity, 2);
  assert.equal(order.items[0].priceCents, 1250);
  assert.equal(order.submittedAt, '2026-11-02T12:00:00.000Z');
  order.items[0].name = 'Changed';
  const stored = await orderRepository.findAll();
  assert.equal(stored[0].items[0].name, 'Classic Burger');
  stored[0].items.length = 0;
  assert.equal((await orderRepository.findAll())[0].items.length, 2);
  assert.deepEqual(await createOrderRepository().findAll(), []);
});

test('invalid orders are rejected without storing partial orders', async () => {
  const { service, orderRepository } = setup();
  const valid = { customerName: 'Abby', items: [{ itemId: 'burger', quantity: 1 }] };
  const invalid = [
    undefined, null, [], {},
    { ...valid, customerName: '  ' },
    { ...valid, customerName: 12 },
    { ...valid, customerName: 'a'.repeat(101) },
    { ...valid, items: [] },
    { ...valid, items: {} },
    ...[null, {}, { itemId: 'missing', quantity: 1 }, { itemId: 1, quantity: 1 }]
      .map((line) => ({ ...valid, items: [valid.items[0], line] })),
    ...[0, -1, 1.5, '2', true, Number.MAX_SAFE_INTEGER, Infinity]
      .map((quantity) => ({ ...valid, items: [{ itemId: 'burger', quantity }] })),
    { ...valid, items: [{ itemId: 'burger', quantity: Number.MAX_SAFE_INTEGER }, { itemId: 'burger', quantity: 1 }] },
  ];
  for (const input of invalid) {
    await assert.rejects(() => service.createOrder(input), ValidationError);
  }
  assert.deepEqual(await orderRepository.findAll(), []);
});
