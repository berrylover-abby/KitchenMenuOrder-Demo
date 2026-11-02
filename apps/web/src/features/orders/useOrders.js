import { readonly, ref } from 'vue';
import { completeOrder, fetchOrders } from './orders.api.js';

export function useOrders(load = fetchOrders, complete = completeOrder) {
  const orders = ref([]);
  const loading = ref(false);
  const error = ref('');
  const hasLoaded = ref(false);
  const updatingId = ref(null);
  const updateError = ref('');

  async function loadOrders() {
    if (loading.value || updatingId.value) return;
    loading.value = true;
    error.value = '';
    updateError.value = '';
    try {
      orders.value = await load();
      hasLoaded.value = true;
    } catch {
      error.value = 'Unable to load orders. Please try again.';
    } finally {
      loading.value = false;
    }
  }

  async function markCompleted(id) {
    if (loading.value || updatingId.value) return;
    updatingId.value = id;
    updateError.value = '';
    try {
      const updated = await complete(id);
      orders.value = orders.value.map((order) => order.id === id ? updated : order);
    } catch {
      updateError.value = 'Unable to confirm the status update. Refresh orders to check the latest status, or try again.';
    } finally {
      updatingId.value = null;
    }
  }

  return {
    orders: readonly(orders), loading: readonly(loading), error: readonly(error),
    hasLoaded: readonly(hasLoaded), updatingId: readonly(updatingId),
    updateError: readonly(updateError), loadOrders, markCompleted,
  };
}
