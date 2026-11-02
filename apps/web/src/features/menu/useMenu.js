import { computed, readonly, ref } from 'vue';
import { fetchMenu } from './menu.api.js';

export function useMenu(load = fetchMenu) {
  const items = ref([]);
  const loading = ref(false);
  const error = ref('');
  const categories = computed(() => [...new Set(items.value.map((item) => item.category))]);

  async function loadMenu() {
    loading.value = true;
    error.value = '';
    try {
      items.value = await load();
    } catch {
      error.value = 'Unable to load the menu. Please try again.';
    } finally {
      loading.value = false;
    }
  }

  return { items: readonly(items), loading: readonly(loading), error: readonly(error), categories, loadMenu };
}
