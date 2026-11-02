import test from 'node:test';
import assert from 'node:assert/strict';
import { useOrders } from '../src/features/orders/useOrders.js';
import { completeOrder, fetchOrders } from '../src/features/orders/orders.api.js';

test('staff list reloads, retains previous orders on failure, and recovers', async () => {
  let result = [];
  let fail = false;
  const state = useOrders(async () => {
    if (fail) throw new Error('Offline');
    return result;
  });
  await state.loadOrders();
  assert.equal(state.hasLoaded.value, true);
  assert.deepEqual(state.orders.value, []);
  result = [{ id: 'new-order' }];
  await state.loadOrders();
  assert.equal(state.orders.value[0].id, 'new-order');
  fail = true;
  await state.loadOrders();
  assert.match(state.error.value, /Unable to load/);
  assert.equal(state.orders.value[0].id, 'new-order');
  assert.equal(state.loading.value, false);
  fail = false;
  await state.loadOrders();
  assert.equal(state.error.value, '');
});

test('staff adapter maps saved orders and rejects malformed responses', async (t) => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  const order = {
    id: 'order-1', customerName: 'Abby', currency: 'CAD', subtotalCents: 2500, status: 'New',
    submittedAt: '2026-11-02T12:00:00.000Z',
    items: [{ itemId: 'burger', name: 'Classic Burger', quantity: 2, priceCents: 1250, lineTotalCents: 2500 }],
  };
  let body = { orders: [order] };
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/orders');
    assert.equal(options.cache, 'no-store');
    return Response.json(body);
  };
  const orders = await fetchOrders();
  assert.equal(orders[0].items[0].quantity, 2);
  assert.equal(orders[0].subtotalCents, 2500);
  for (const invalid of [{}, { orders: [null] }, { orders: [{ ...order, submittedAt: 'bad' }] },
    { orders: [{ ...order, items: [{ ...order.items[0], quantity: 0 }] }] }]) {
    body = invalid;
    await assert.rejects(() => fetchOrders(), /invalid/);
  }
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/orders/order-1/status');
    assert.equal(options.method, 'PATCH');
    assert.deepEqual(JSON.parse(options.body), { status: 'Completed' });
    return Response.json({ ...order, status: 'Completed' });
  };
  assert.equal((await completeOrder('order-1')).status, 'Completed');
});

test('status updates wait for confirmation, block overlapping actions and preserve state on failure', async () => {
  let finish;
  let calls = 0;
  let fail = false;
  const state = useOrders(async () => [{ id: 'a', status: 'New' }], async () => {
    calls++;
    if (fail) throw new Error('Offline');
    return new Promise((resolve) => { finish = resolve; });
  });
  await state.loadOrders();
  const pending = state.markCompleted('a');
  assert.equal(state.updatingId.value, 'a');
  assert.equal(state.orders.value[0].status, 'New');
  await state.markCompleted('a');
  await state.loadOrders();
  assert.equal(calls, 1);
  finish({ id: 'a', status: 'Completed' });
  await pending;
  assert.equal(state.orders.value[0].status, 'Completed');
  assert.equal(state.updatingId.value, null);
  await state.loadOrders();
  fail = true;
  await state.markCompleted('a');
  assert.equal(state.orders.value[0].status, 'New');
  assert.match(state.updateError.value, /Refresh orders/);
  assert.equal(state.updatingId.value, null);
});
