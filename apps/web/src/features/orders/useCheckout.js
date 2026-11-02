import { readonly, ref } from 'vue';
import { useCart } from '../cart/useCart.js';
import { submitOrder } from './orders.api.js';

export function createCheckout(cart, sendOrder = submitOrder) {
  const customerName = ref('');
  const submitting = ref(false);
  const error = ref('');
  const confirmation = ref(null);

  async function placeOrder() {
    if (submitting.value) return;
    error.value = '';
    confirmation.value = null;
    if (!cart.items.value.length) {
      error.value = 'Add at least one dish before placing your order.';
      return;
    }
    const name = customerName.value.trim();
    if (!name || name.length > 100) {
      error.value = 'Enter a customer name between 1 and 100 characters.';
      return;
    }
    const payload = {
      customerName: name,
      items: cart.items.value.map(({ itemId, quantity }) => ({ itemId, quantity })),
    };
    submitting.value = true;
    try {
      confirmation.value = await sendOrder(payload);
      cart.clearCart();
      customerName.value = '';
    } catch (failure) {
      error.value = failure.status === 400
        ? failure.message
        : 'We could not confirm your order. Your cart has been kept. Check with the restaurant before retrying to avoid a duplicate order.';
    } finally {
      submitting.value = false;
    }
  }

  return {
    customerName, submitting: readonly(submitting), error: readonly(error),
    confirmation: readonly(confirmation), placeOrder,
  };
}

// Share pending state across route navigation to prevent concurrent submissions.
const checkout = createCheckout(useCart());
export function useCheckout() { return checkout; }
