import { computed, readonly, ref } from 'vue';
import { calculateSubtotal, setQuantity } from './cart.js';

// One store per application; factory allows isolated consumers and tests.
// Menu snapshots come from the caller, keeping cart state independent of HTTP.
export function createCartStore() {
  const cart = ref([]);
  const menu = ref([]);
  const lines = computed(() => cart.value.map((line) => {
    const item = menu.value.find((dish) => dish.id === line.itemId);
    return { ...item, quantity: line.quantity, lineTotalCents: item.priceCents * line.quantity };
  }));
  const itemCount = computed(() => cart.value.reduce((count, line) => count + line.quantity, 0));
  const subtotalCents = computed(() => calculateSubtotal(cart.value, menu.value));

  function addItem(item) {
    const quantity = cart.value.find((line) => line.itemId === item.id)?.quantity || 0;
    const updated = setQuantity(cart.value, item.id, quantity + 1);
    menu.value = [...menu.value.filter((dish) => dish.id !== item.id), { ...item }];
    cart.value = updated;
  }

  function updateQuantity(itemId, quantity) {
    if (!cart.value.some((line) => line.itemId === itemId)) return;
    cart.value = setQuantity(cart.value, itemId, quantity);
    if (quantity === 0) menu.value = menu.value.filter((item) => item.id !== itemId);
  }

  function removeItem(itemId) { updateQuantity(itemId, 0); }
  function clearCart() { cart.value = []; menu.value = []; }

  return {
    items: readonly(cart), lines: readonly(lines), itemCount, subtotalCents,
    addItem, updateQuantity, removeItem, clearCart,
  };
}

const cart = createCartStore();
export function useCart() { return cart; }
