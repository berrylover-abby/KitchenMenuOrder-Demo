<template>
  <header class="site-header">
    <RouterLink class="brand" to="/">
      <svg class="brand-mark" viewBox="0 0 64 48" fill="none" aria-hidden="true">
        <path d="M15 32a17 17 0 0 1 34 0" fill="#F4C553" />
        <path d="M32 2v7M11 10l5 5M53 10l-5 5M3 28h7M54 28h7" stroke="#EBA044" stroke-width="3" stroke-linecap="round" />
        <path d="M2 41c18-19 31 7 60-6-18 20-40-2-60 6Z" fill="#758848" />
      </svg>
      QuickBite
    </RouterLink>
    <nav aria-label="Main navigation">
      <RouterLink to="/">Menu</RouterLink>
      <RouterLink to="/staff">Staff</RouterLink>
    </nav>
  </header>
  <main><RouterView /></main>
</template>
