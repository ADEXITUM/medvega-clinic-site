<script setup lang="ts">
const KEY = 'medvega:cookies'
const visible = ref(false)

onMounted(() => {
  try {
    visible.value = localStorage.getItem(KEY) !== 'ok'
  } catch {
    visible.value = true
  }
})

function accept() {
  try {
    localStorage.setItem(KEY, 'ok')
  } catch {
    /* выбор не сохранится, но баннер закроется */
  }
  visible.value = false
}
</script>

<template>
  <div v-if="visible" class="cookie" role="region" aria-label="Уведомление о cookie" data-testid="cookie-banner">
    <p class="cookie__text">
      Сайт использует cookie и локальное хранилище браузера, чтобы запоминать ваши настройки и записи. Подробнее – в
      <NuxtLink to="/privacy">политике обработки персональных данных</NuxtLink>.
    </p>
    <button type="button" class="btn btn--secondary btn--sm" @click="accept">Понятно</button>
  </div>
</template>

<style lang="scss" scoped>
.cookie {
  position: fixed;
  right: var(--sp-3);
  bottom: calc(76px + env(safe-area-inset-bottom, 0px));
  left: var(--sp-3);
  z-index: 150;
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-3);
  align-items: center;
  padding: var(--sp-4);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-lg);

  @include up(md) {
    left: auto;
    max-width: 30rem;
  }

  @include up(lg) {
    bottom: var(--sp-3);
  }

  &__text {
    flex: 1 1 16rem;
    font-size: var(--fs-sm);
  }
}
</style>
