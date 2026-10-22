<script setup lang="ts">
import { ArrowUp } from '@lucide/vue'

/** Кнопка «Наверх» появляется после прокрутки на два экрана */
const visible = ref(false)
const onScroll = () => (visible.value = window.scrollY > window.innerHeight * 2)

function toTop() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  document.querySelector<HTMLElement>('#main')?.focus({ preventScroll: true })
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <Transition name="fade">
    <button v-show="visible" type="button" class="to-top" @click="toTop">
      <ArrowUp :size="22" aria-hidden="true" />
      <span class="visually-hidden">Наверх</span>
    </button>
  </Transition>
</template>

<style lang="scss" scoped>
.to-top {
  position: fixed;
  right: var(--sp-4);
  bottom: calc(76px + env(safe-area-inset-bottom, 0px));
  z-index: 55;
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  color: var(--c-on-primary);
  background: var(--c-primary);
  border: 0;
  border-radius: 50%;
  box-shadow: var(--shadow-md);

  @include up(lg) {
    bottom: var(--sp-5);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media print {
  .to-top {
    display: none !important;
  }
}
</style>
