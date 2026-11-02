<script setup>
import { onMounted } from 'vue';
import { useOrders } from './useOrders.js';
import OrderCard from './OrderCard.vue';

const { orders, loading, error, hasLoaded, loadOrders, updatingId, updateError, markCompleted } = useOrders();
onMounted(loadOrders);
</script>

<template>
  <div class="staff-heading">
    <h1>Pickup orders</h1>
    <button type="button" :disabled="loading || !!updatingId" @click="loadOrders">{{ loading ? 'Refreshing…' : 'Refresh orders' }}</button>
  </div>
  <p class="muted">Newest orders first. Refresh to see incoming orders. Times use your local timezone.</p>
  <p v-if="loading" role="status">Loading orders…</p>
  <p v-if="updateError" class="checkout-error" role="alert">{{ updateError }}</p>
  <div v-if="error" class="checkout-error" role="alert">
    <p>{{ error }}</p>
    <p v-if="hasLoaded">Previously loaded orders are shown below and may be out of date.</p>
    <button type="button" :disabled="loading" @click="loadOrders">Try again</button>
  </div>
  <p v-if="hasLoaded && !orders.length && !loading && !error">No pickup orders yet.</p>
  <p v-if="hasLoaded" class="sr-only" role="status">{{ orders.length }} orders loaded.</p>
  <div class="order-grid" :aria-busy="loading">
    <OrderCard v-for="order in orders" :key="order.id" :order="order"
      :disabled="loading || !!updatingId" :updating="updatingId === order.id" @complete="markCompleted" />
  </div>
</template>
