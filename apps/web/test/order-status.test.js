import test from 'node:test';
import assert from 'node:assert/strict';
import { useOrderStatus } from '../src/features/orders/useOrderStatus.js';
import { fetchOrderStatus } from '../src/features/orders/orders.api.js';

test('customer refresh shows completion, preserves stale status on network error, clears missing orders', async () => {
  let status = 'New';
  let failure;
  const state = useOrderStatus(async (id) => {
    if (failure) throw failure;
    return { id, status };
  });
  await state.loadStatus('a');
  assert.equal(state.order.value.status, 'New');
  status = 'Completed';
  await state.loadStatus('a');
  assert.equal(state.order.value.status, 'Completed');
  failure = new Error('Offline');
  await state.loadStatus('a');
  assert.equal(state.order.value.status, 'Completed');
  assert.match(state.error.value, /Unable to refresh/);
  failure.status = 404;
  await state.loadStatus('a');
  assert.equal(state.order.value, null);
  assert.match(state.error.value, /Order not found/);
  assert.equal(state.loading.value, false);
});

test('navigation ignores late results from a previous order', async () => {
  let finish;
  const state = useOrderStatus((id) => id === 'a'
    ? new Promise((resolve) => { finish = resolve; })
    : Promise.resolve({ id, status: 'Completed' }));
  const previous = state.loadStatus('a');
  await state.loadStatus('b');
  finish({ id: 'a', status: 'New' });
  await previous;
  assert.equal(state.order.value.id, 'b');
});

test('customer adapter fetches fresh status and rejects invalid responses', async (t) => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  let body = { id: 'a', status: 'Completed' };
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/orders/a/status');
    assert.equal(options.cache, 'no-store');
    return Response.json(body);
  };
  assert.deepEqual(await fetchOrderStatus('a'), body);
  for (const invalid of [{ id: 'b', status: 'New' }, { id: 'a', status: 'Unknown' }]) {
    body = invalid;
    await assert.rejects(() => fetchOrderStatus('a'), /invalid order status/);
  }
});
