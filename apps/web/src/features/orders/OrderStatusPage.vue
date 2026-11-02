<script setup>
import { watch } from 'vue';
import { useOrderStatus } from './useOrderStatus.js';

const props = defineProps({ id: { type: String, required: true } });
const { order, loading, error, loadStatus } = useOrderStatus();
watch(() => props.id, (id) => loadStatus(id), { immediate: true });
</script>

<template>
  <h1>Your pickup order</h1>
  <p class="order-id">Order ID: <strong>{{ id }}</strong></p>
  <p class="muted">Save this link to check your order again. Refresh to see the latest status.</p>
  <p v-if="loading" role="status">Checking your order…</p>
  <p v-if="error" class="checkout-error" role="alert">{{ error }}</p>
  <section v-if="order" class="card" aria-live="polite">
    <h2>Order status: <span class="order-status" :class="{ completed: order.status === 'Completed' }">{{ order.status }}</span></h2>
    <p v-if="order.status === 'Completed'">Your order has been marked Completed by the restaurant.</p>
    <p v-else>Your order has been received and is awaiting completion.</p>
    <p v-if="error" class="muted">This is the last known status and may be out of date.</p>
  </section>
  <div class="status-actions">
    <button type="button" :disabled="loading" @click="loadStatus(id)">Refresh status</button>
    <RouterLink to="/">Back to menu</RouterLink>
  </div>
</template>
