<script setup lang="ts">
const { load } = useA11y()
onMounted(load)
</script>

<template>
  <div class="layout">
    <a class="skip-link" href="#main">Перейти к содержимому</a>
    <AppHeader />
    <A11yPanel />
    <main id="main" class="layout__main" tabindex="-1">
      <slot />
    </main>
    <AppFooter />
    <CallbackModal />
    <CookieBanner />
    <AppToasts />
  </div>
</template>

<style lang="scss" scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  &__main {
    flex: 1;

    &:focus {
      outline: none;
    }
  }
}

.skip-link {
  position: absolute;
  top: var(--sp-2);
  left: var(--sp-2);
  z-index: 1000;
  padding: var(--sp-3) var(--sp-4);
  font-weight: 700;
  color: var(--c-on-primary);
  background: var(--c-primary);
  border-radius: var(--r-md);
  transform: translateY(-200%);

  &:focus {
    transform: none;
  }
}
</style>
