<script setup>
import { onMounted, ref } from 'vue';
import { useMenu } from './useMenu.js';
import MenuItemCard from './MenuItemCard.vue';
import CartPanel from '../cart/CartPanel.vue';
import { useCart } from '../cart/useCart.js';
import { useCheckout } from '../orders/useCheckout.js';
import CheckoutForm from '../orders/CheckoutForm.vue';

const { items, loading, error, categories, loadMenu } = useMenu();
const { addItem } = useCart();
const { submitting } = useCheckout();
const announcement = ref('');
function addToCart(item) {
  addItem(item);
  announcement.value = `${item.name} added to your cart.`;
}
onMounted(loadMenu);
</script>

<template>
  <div class="menu-hero">
    <h1>Fresh food, ready for <span>pickup</span></h1>
    <p class="muted">Explore our menu. All prices are in CAD.</p>
  </div>
  <p class="sr-only" role="status">{{ announcement }}</p>
  <div class="ordering-layout">
  <div>
  <p v-if="loading" role="status">Loading menu…</p>
  <div v-else-if="error" role="alert">
    <p>{{ error }}</p>
    <button @click="loadMenu">Try again</button>
  </div>
  <p v-else-if="!items.length">The menu is currently empty.</p>
  <section v-for="category in categories" v-else :key="category">
    <h2 class="category-heading"><span class="category-icon" aria-hidden="true">{{ category === 'Mains' ? '♧' : '❧' }}</span>{{ category }}</h2>
    <div class="menu-grid">
      <MenuItemCard v-for="item in items.filter((dish) => dish.category === category)" :key="item.id" :item="item" :disabled="submitting" @add="addToCart" />
    </div>
  </section>
  </div>
  <CartPanel :disabled="submitting"><CheckoutForm /></CartPanel>
  </div>
</template>
