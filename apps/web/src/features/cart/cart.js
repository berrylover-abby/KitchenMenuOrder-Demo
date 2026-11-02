// Framework-independent cart rules. Each update returns new state.
export function setQuantity(cart, itemId, quantity) {
  if (typeof itemId !== 'string' || !itemId) throw new Error('An item ID is required.');
  if (!Number.isSafeInteger(quantity) || quantity < 0) {
    throw new Error('Quantity must be a non-negative integer.');
  }
  if (quantity === 0) return cart.filter((line) => line.itemId !== itemId);
  if (cart.some((line) => line.itemId === itemId)) {
    return cart.map((line) => line.itemId === itemId ? { itemId, quantity } : line);
  }
  return [...cart, { itemId, quantity }];
}

// Display estimate only. The API must independently price submitted orders.
export function calculateSubtotal(cart, menuItems) {
  const menu = new Map(menuItems.map((item) => [item.id, item]));
  return cart.reduce((total, line) => {
    const item = menu.get(line.itemId);
    if (!item) throw new Error('A cart item is no longer available.');
    return total + item.priceCents * line.quantity;
  }, 0);
}
