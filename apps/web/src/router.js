import { createRouter, createWebHistory } from 'vue-router';
import MenuPage from './features/menu/MenuPage.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: MenuPage },
    { path: '/orders/:id', props: true, component: () => import('./features/orders/OrderStatusPage.vue') },
    { path: '/staff', component: () => import('./features/orders/StaffPage.vue') },
  ],
});
