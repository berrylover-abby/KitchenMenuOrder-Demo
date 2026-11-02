import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

test('API serves menu data, health and consistent errors', async (t) => {
  const server = createApp().listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.equal((await fetch(`${base}/api/health`)).status, 200);
  const response = await fetch(`${base}/api/menu`);
  assert.equal(response.status, 200);
  const menu = await response.json();
  assert.equal(menu.currency, 'CAD');
  assert.ok(menu.items.length >= 6);
  assert.ok(new Set(menu.items.map((item) => item.category)).size >= 2);
  assert.ok(menu.items.every((item) => Number.isSafeInteger(item.priceCents)));
  const missing = await fetch(`${base}/api/missing`);
  assert.equal(missing.status, 404);
  assert.equal((await missing.json()).error.code, 'NOT_FOUND');
  const malformed = await fetch(`${base}/api/menu`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{',
  });
  assert.equal(malformed.status, 400);
  assert.equal((await malformed.json()).error.code, 'INVALID_JSON');
});
