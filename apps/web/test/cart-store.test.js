import test from 'node:test';
import assert from 'node:assert/strict';
import { createCartStore } from '../src/features/cart/useCart.js';

test('cart supports a two-dish flow, repeated add, quantities, removal and clearing', () => {
  const cart = createCartStore();
  const burger = { id: 'burger', name: 'Burger', priceCents: 1250 };
  const fries = { id: 'fries', name: 'Fries', priceCents: 450 };
  assert.equal(cart.subtotalCents.value, 0);
  cart.addItem(burger);
  cart.addItem(fries);
  cart.addItem(burger);
  assert.equal(cart.lines.value.length, 2);
  assert.equal(cart.itemCount.value, 3);
  assert.equal(cart.subtotalCents.value, 2950);
  cart.updateQuantity('burger', 3);
  assert.deepEqual(cart.lines.value.map((item) => item.id), ['burger', 'fries']);
  assert.equal(cart.lines.value[0].lineTotalCents, 3750);
  assert.equal(cart.subtotalCents.value, 4200);
  cart.updateQuantity('fries', 0);
  assert.equal(cart.lines.value.length, 1);
  cart.removeItem('burger');
  assert.equal(cart.itemCount.value, 0);
  assert.equal(cart.subtotalCents.value, 0);
  cart.addItem(fries);
  cart.clearCart();
  assert.deepEqual(cart.items.value, []);
});

test('cart keeps its own menu snapshots and rejects invalid quantity updates', () => {
  const cart = createCartStore();
  const item = { id: 'a', name: 'Dish', priceCents: 100 };
  cart.addItem(item);
  item.priceCents = 999;
  assert.equal(cart.subtotalCents.value, 100);
  assert.throws(() => cart.updateQuantity('a', -1));
  assert.throws(() => cart.updateQuantity('a', 1.5));
  assert.equal(cart.itemCount.value, 1);
  assert.equal(createCartStore().itemCount.value, 0);
});
