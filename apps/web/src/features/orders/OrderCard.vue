<script setup>
import { formatMoney } from '../../shared/money.js';

defineProps({ order: { type: Object, required: true }, disabled: Boolean, updating: Boolean });
defineEmits(['complete']);
const dateFormatter = new Intl.DateTimeFormat('en-CA', { dateStyle: 'medium', timeStyle: 'short' });
function formatTime(value) { return dateFormatter.format(new Date(value)); }
</script>

<template>
  <article class="card order-card">
    <h2>{{ order.customerName }}</h2>
    <p role="status"><span class="order-status" :class="{ completed: order.status === 'Completed' }">{{ order.status }}</span></p>
    <p class="order-id">Order ID: <strong>{{ order.id }}</strong></p>
    <p class="muted">Submitted: <time :datetime="order.submittedAt">{{ formatTime(order.submittedAt) }}</time></p>
    <ul class="order-items">
      <li v-for="item in order.items" :key="item.itemId">
        <span>{{ item.quantity }} × {{ item.name }}</span>
        <span>{{ formatMoney(item.lineTotalCents) }}</span>
      </li>
    </ul>
    <div class="cart-subtotal">
      <strong>Subtotal (CAD)</strong>
      <strong>{{ formatMoney(order.subtotalCents) }}</strong>
    </div>
    <button v-if="order.status === 'New'" type="button" class="complete-order" :disabled="disabled"
      :aria-label="`Mark order for ${order.customerName} as Completed`" @click="$emit('complete', order.id)">
      {{ updating ? 'Updating…' : 'Mark as Completed' }}
    </button>
  </article>
</template>
