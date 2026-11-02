import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { createOrderRepository } from '../src/features/orders/order.repository.js';

test('POST orders returns 201, unique IDs, server totals and 400 validation errors', async (t) => {
  const orderRepository = createOrderRepository();
  const server = createApp({ orderRepository }).listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}/api/orders`;
  const post = (body) => fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const valid = { customerName: 'Abby', items: [{ itemId: 'burger', quantity: 2 }], subtotalCents: 1 };
  assert.deepEqual(await (await fetch(url)).json(), { orders: [] });
  const response = await post(valid);
  assert.equal(response.status, 201);
  const order = await response.json();
  assert.equal(order.status, 'New');
  assert.deepEqual(await (await fetch(`${url}/${order.id}/status`)).json(), { id: order.id, status: 'New' });
  assert.equal(order.subtotalCents, 2500);
  assert.equal(order.currency, 'CAD');
  assert.ok(Number.isFinite(Date.parse(order.submittedAt)));
  const second = await (await post(valid)).json();
  assert.notEqual(order.id, second.id);
  for (const body of [
    { ...valid, customerName: '' }, { ...valid, items: [] },
    { ...valid, items: [{ itemId: 'missing', quantity: 1 }] },
    { ...valid, items: [{ itemId: 'burger', quantity: 0 }] },
  ]) {
    const rejected = await post(body);
    assert.equal(rejected.status, 400);
    assert.equal((await rejected.json()).error.code, 'INVALID_ORDER');
  }
  assert.equal((await orderRepository.findAll()).length, 2);
  for (let refresh = 0; refresh < 2; refresh++) {
    const listed = await fetch(url);
    assert.equal(listed.status, 200);
    assert.equal(listed.headers.get('cache-control'), 'no-store');
    const { orders } = await listed.json();
    assert.equal(orders.length, 2);
    assert.ok(orders[0].submittedAt >= orders[1].submittedAt);
    assert.deepEqual(orders.find((saved) => saved.id === order.id), order);
  }
  const patch = (id, status) => fetch(`${url}/${id}/status`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
  });
  for (let attempt = 0; attempt < 2; attempt++) {
    const completed = await patch(order.id, 'Completed');
    assert.equal(completed.status, 200);
    assert.deepEqual(await completed.json(), { ...order, status: 'Completed' });
  }
  assert.equal((await patch(order.id, 'New')).status, 400);
  assert.equal((await patch(order.id, 'Invalid')).status, 400);
  assert.equal((await patch('missing-order', 'Completed')).status, 404);
  const refreshed = (await (await fetch(url)).json()).orders;
  assert.equal(refreshed.find((saved) => saved.id === order.id).status, 'Completed');
  assert.equal(refreshed.find((saved) => saved.id === second.id).status, 'New');
  const customerStatus = await fetch(`${url}/${order.id}/status`);
  assert.equal(customerStatus.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await customerStatus.json(), { id: order.id, status: 'Completed' });
  assert.equal((await fetch(`${url}/missing/status`)).status, 404);
});
