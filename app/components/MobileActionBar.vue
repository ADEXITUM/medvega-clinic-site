<script setup lang="ts">
import { CalendarCheck, Phone } from '@lucide/vue'
import { getClinic } from '~/services/api'

/** Закреплённая панель действий на телефоне: позвонить и записаться всегда под пальцем */
const { data: clinic } = await useAsyncData('clinic', getClinic)
const route = useRoute()
const hidden = computed(() => route.path.startsWith('/booking'))
</script>

<template>
  <div v-if="clinic && !hidden" class="action-bar" data-testid="action-bar">
    <a :href="`tel:${clinic.phoneHref}`" class="btn btn--secondary action-bar__btn">
      <Phone :size="18" aria-hidden="true" /> Позвонить
    </a>
    <NuxtLink to="/booking" class="btn btn--primary action-bar__btn">
      <CalendarCheck :size="18" aria-hidden="true" /> Записаться
    </NuxtLink>
  </div>
</template>

<style lang="scss" scoped>
.action-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 60;
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--gutter) calc(var(--sp-2) + env(safe-area-inset-bottom, 0px));
  background: var(--c-surface);
  border-top: 1px solid var(--c-border);
  box-shadow: 0 -4px 16px rgb(16 42 56 / 8%);

  @include up(lg) {
    display: none;
  }

  &__btn {
    min-height: 48px;
  }
}

@media print {
  .action-bar {
    display: none;
  }
}
</style>
