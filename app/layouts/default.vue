<script setup lang="ts">
const { load } = useA11y()
onMounted(load)

// на телефоне внизу закреплена панель действий (кроме мастера записи) – под неё оставляется место
const route = useRoute()
const withBar = computed(() => !route.path.startsWith('/booking'))
</script>

<template>
  <div :class="['layout', { 'layout--with-bar': withBar }]">
    <a class="skip-link" href="#main">Перейти к содержимому</a>
    <AppHeader />
    <A11yPanel />
    <main id="main" class="layout__main" tabindex="-1">
      <slot />
    </main>
    <AppFooter />
    <MobileActionBar />
    <BackToTop />
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

  &--with-bar {
    @include down(lg) {
      padding-bottom: calc(68px + env(safe-area-inset-bottom, 0px));
    }
  }

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
