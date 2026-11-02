<script setup>
import { formatMoney } from '../../shared/money.js';
import { ref } from 'vue';

const imageFailed = ref(false);

defineProps({ item: { type: Object, required: true }, disabled: Boolean });
defineEmits(['add']);
</script>

<template>
  <article class="card menu-item">
    <img v-if="item.imageUrl && !imageFailed" class="dish-photo" :src="item.imageUrl" alt="" loading="lazy" @error="imageFailed = true" />
    <div v-else class="dish-photo dish-placeholder" aria-hidden="true">❧</div>
    <div class="menu-item-content">
    <h3>{{ item.name }}</h3>
    <p class="muted">{{ item.description }}</p>
    <div class="menu-item-footer">
      <strong>{{ formatMoney(item.priceCents) }}</strong>
      <button type="button" :disabled="disabled" :aria-label="`Add ${item.name} to cart`" @click="$emit('add', item)"><span aria-hidden="true">＋</span> Add</button>
    </div>
    </div>
  </article>
</template>
