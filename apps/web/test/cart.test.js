import test from 'node:test';
import assert from 'node:assert/strict';
import { setQuantity, calculateSubtotal } from '../src/features/cart/cart.js';

test('cart updates do not mutate existing state and zero removes an item', () => {
  const original = [{ itemId: 'a', quantity: 1 }];
  const updated = setQuantity(original, 'a', 3);
  assert.deepEqual(original, [{ itemId: 'a', quantity: 1 }]);
  assert.deepEqual(updated, [{ itemId: 'a', quantity: 3 }]);
  assert.deepEqual(setQuantity(updated, 'a', 0), []);
  assert.throws(() => setQuantity(original, 'a', 1.5));
  assert.throws(() => setQuantity(original, 'a', -1));
});

test('subtotal uses integer cents and rejects unavailable items', () => {
  assert.equal(calculateSubtotal([{ itemId: 'a', quantity: 3 }], [{ id: 'a', priceCents: 1250 }]), 3750);
  assert.throws(() => calculateSubtotal([{ itemId: 'missing', quantity: 1 }], []));
});
