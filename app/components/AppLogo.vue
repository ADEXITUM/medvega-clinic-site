<template>
  <NuxtLink to="/" class="logo" aria-label="МедВега – на главную">
    <svg class="logo__mark" viewBox="0 0 32 32" width="36" height="36" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="currentColor" />
      <path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z" fill="var(--c-surface)" />
    </svg>
    <span class="logo__text">Мед<span class="logo__accent">Вега</span></span>
  </NuxtLink>
</template>

<style lang="scss" scoped>
.logo {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  min-height: var(--tap);
  font-weight: 700;
  font-size: 1.375rem;
  color: var(--c-primary);
  text-decoration: none;

  &__text {
    color: var(--c-text);
  }

  &__accent {
    color: var(--c-primary);
  }
}
</style>
