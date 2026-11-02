import { readonly, ref } from 'vue';
import { fetchOrderStatus } from './orders.api.js';

export function useOrderStatus(load = fetchOrderStatus) {
  const order = ref(null);
  const loading = ref(false);
  const error = ref('');
  let version = 0;

  async function loadStatus(id) {
    const requestVersion = ++version;
    if (order.value?.id !== id) order.value = null;
    loading.value = true;
    error.value = '';
    try {
      const result = await load(id);
      if (version === requestVersion) order.value = result;
    } catch (failure) {
      if (version !== requestVersion) return;
      if (failure.status === 404) {
        order.value = null;
        error.value = 'Order not found. Check your link. Orders are cleared when the demo server restarts.';
      } else {
        error.value = 'Unable to refresh your order status. Please try again.';
      }
    } finally {
      if (version === requestVersion) loading.value = false;
    }
  }

  return { order: readonly(order), loading: readonly(loading), error: readonly(error), loadStatus };
}
