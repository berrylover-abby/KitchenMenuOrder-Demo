import test from 'node:test';
import assert from 'node:assert/strict';
import { createCartStore } from '../src/features/cart/useCart.js';
import { createCheckout } from '../src/features/orders/useCheckout.js';
import { submitOrder } from '../src/features/orders/orders.api.js';

const dish = { id: 'burger', name: 'Burger', priceCents: 1250 };

test('checkout validates empty cart and blank/long names without sending requests', async () => {
  const cart = createCartStore();
  let calls = 0;
  const checkout = createCheckout(cart, async () => { calls++; });
  await checkout.placeOrder();
  assert.match(checkout.error.value, /Add at least one/);
  cart.addItem(dish);
  for (const name of ['', '   ', 'a'.repeat(101)]) {
    checkout.customerName.value = name;
    await checkout.placeOrder();
    assert.match(checkout.error.value, /customer name/);
  }
  assert.equal(calls, 0);
  assert.equal(cart.itemCount.value, 1);
});

test('checkout blocks concurrent submission and clears cart only after success', async () => {
  const cart = createCartStore();
  cart.addItem(dish);
  cart.addItem(dish);
  let resolveOrder;
  let calls = 0;
  const checkout = createCheckout(cart, (payload) => {
    calls++;
    assert.deepEqual(payload, { customerName: 'Abby', items: [{ itemId: 'burger', quantity: 2 }] });
    return new Promise((resolve) => { resolveOrder = resolve; });
  });
  checkout.customerName.value = ' Abby ';
  const pending = checkout.placeOrder();
  assert.equal(checkout.submitting.value, true);
  await checkout.placeOrder();
  assert.equal(calls, 1);
  assert.equal(cart.itemCount.value, 2);
  resolveOrder({ id: 'order-1', customerName: 'Abby', subtotalCents: 2600 });
  await pending;
  assert.equal(cart.itemCount.value, 0);
  assert.equal(checkout.customerName.value, '');
  assert.equal(checkout.confirmation.value.subtotalCents, 2600);
  assert.equal(checkout.submitting.value, false);
});

test('failed submissions preserve cart and name, and allow deliberate retry', async () => {
  const cart = createCartStore();
  cart.addItem(dish);
  let failure = Object.assign(new Error('Unknown menu item.'), { status: 400 });
  const checkout = createCheckout(cart, async () => { throw failure; });
  checkout.customerName.value = 'Abby';
  await checkout.placeOrder();
  assert.equal(checkout.error.value, 'Unknown menu item.');
  failure = new TypeError('Failed to fetch');
  await checkout.placeOrder();
  assert.match(checkout.error.value, /before retrying/);
  assert.equal(cart.itemCount.value, 1);
  assert.equal(checkout.customerName.value, 'Abby');
  assert.equal(checkout.submitting.value, false);
  assert.equal(checkout.confirmation.value, null);
});

test('order adapter sends only IDs and quantities, maps confirmation, and reports API errors', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/orders');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers['Content-Type'], 'application/json');
    assert.deepEqual(JSON.parse(options.body), {
      customerName: 'Abby', items: [{ itemId: 'burger', quantity: 1 }],
    });
    return Response.json({ id: 'order-1', customerName: 'Abby', subtotalCents: 1250, currency: 'CAD' }, { status: 201 });
  };
  const request = { customerName: 'Abby', items: [{ itemId: 'burger', quantity: 1, priceCents: 1 }] };
  assert.equal((await submitOrder(request)).id, 'order-1');
  globalThis.fetch = async () => Response.json({ error: { message: 'Invalid quantity.' } }, { status: 400 });
  await assert.rejects(() => submitOrder(request), (error) => error.status === 400 && error.message === 'Invalid quantity.');
  globalThis.fetch = async () => Response.json({ id: 'missing-fields' }, { status: 201 });
  await assert.rejects(() => submitOrder(request), /invalid order confirmation/);
});
