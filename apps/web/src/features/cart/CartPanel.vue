<script setup>
import { useCart } from './useCart.js';
import { formatMoney } from '../../shared/money.js';

const { lines, itemCount, subtotalCents, updateQuantity, removeItem } = useCart();
defineProps({ disabled: Boolean });
</script>

<template>
  <aside class="card cart-panel" aria-labelledby="cart-heading">
    <h2 id="cart-heading"><svg class="cart-icon" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M2 4h5l5 17h16l3-12H9M13 26h.01M26 26h.01" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg> Your cart <span class="muted">({{ itemCount }})</span></h2>
    <p v-if="!lines.length" class="muted">Your cart is empty. Add a dish to get started.</p>
    <ul v-else class="cart-lines">
      <li v-for="line in lines" :key="line.id" class="cart-line">
        <div class="cart-line-heading">
          <strong>{{ line.name }}</strong>
          <span>{{ formatMoney(line.lineTotalCents) }}</span>
        </div>
        <p class="muted unit-price">{{ formatMoney(line.priceCents) }} each</p>
        <div class="cart-line-actions">
          <div class="quantity-controls" role="group" :aria-label="`Quantity for ${line.name}`">
            <button type="button" :disabled="disabled" :aria-label="`Decrease ${line.name} quantity`" @click="updateQuantity(line.id, line.quantity - 1)">−</button>
            <span :aria-label="`${line.quantity} in cart`">{{ line.quantity }}</span>
            <button type="button" :disabled="disabled" :aria-label="`Increase ${line.name} quantity`" @click="updateQuantity(line.id, line.quantity + 1)">+</button>
          </div>
          <button type="button" :disabled="disabled" class="remove-button" :aria-label="`Remove ${line.name} from cart`" @click="removeItem(line.id)">Remove</button>
        </div>
      </li>
    </ul>
    <div class="cart-subtotal" aria-live="polite" aria-atomic="true">
      <strong>Subtotal (CAD)</strong>
      <strong>{{ formatMoney(subtotalCents) }}</strong>
    </div>
    <slot />
  </aside>
</template>
