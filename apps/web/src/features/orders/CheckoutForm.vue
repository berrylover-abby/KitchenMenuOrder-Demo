<script setup>
import { useCart } from '../cart/useCart.js';
import { useCheckout } from './useCheckout.js';
import { formatMoney } from '../../shared/money.js';

const { itemCount } = useCart();
const { customerName, submitting, error, confirmation, placeOrder } = useCheckout();
</script>

<template>
  <section v-if="confirmation" class="order-confirmation" role="status" aria-live="polite">
    <h3><span class="success-check" aria-hidden="true">✓</span> Order placed!</h3>
    <p>Thank you, {{ confirmation.customerName }}. Your pickup order has been received.</p>
    <p>Order ID: <strong class="order-id">{{ confirmation.id }}</strong></p>
    <p>Order subtotal: <strong>{{ formatMoney(confirmation.subtotalCents) }} CAD</strong></p>
    <RouterLink :to="`/orders/${encodeURIComponent(confirmation.id)}`">View order status</RouterLink>
  </section>
  <form class="checkout-form" novalidate :aria-busy="submitting" @submit.prevent="placeOrder">
    <label for="customer-name">Customer name</label>
    <input id="customer-name" v-model="customerName" name="customerName" autocomplete="name"
      maxlength="100" required :disabled="submitting" :aria-invalid="!!error"
      :aria-describedby="error ? 'checkout-error' : undefined" />
    <p v-if="error" id="checkout-error" class="checkout-error" role="alert">{{ error }}</p>
    <button type="submit" :disabled="submitting || !itemCount">
      {{ submitting ? 'Placing order…' : 'Place order' }}
    </button>
    <p v-if="submitting" role="status" class="muted">Sending your order. Please wait…</p>
  </form>
</template>
