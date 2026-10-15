<script setup lang="ts">
import { CalendarDays, Percent } from '@lucide/vue'
import type { Promo } from '~/types'

defineProps<{ promo: Promo; headingLevel?: 'h2' | 'h3' }>()
</script>

<template>
  <article class="promo card" data-testid="promo-card">
    <div class="promo__icon"><Percent :size="24" aria-hidden="true" /></div>
    <component :is="headingLevel ?? 'h3'" class="promo__title">{{ promo.title }}</component>
    <p class="promo__text">{{ promo.text }}</p>
    <p class="promo__date">
      <CalendarDays :size="18" aria-hidden="true" />
      Действует до {{ formatDate(promo.until) }} г.
    </p>
    <NuxtLink :to="{ path: '/booking', query: { direction: promo.direction } }" class="btn btn--secondary btn--sm">
      Записаться<span class="visually-hidden"> по акции «{{ promo.title }}»</span>
    </NuxtLink>
    <!-- 38-ФЗ «О рекламе», ст. 24, ч. 7: предупреждение не менее 5 % площади рекламы -->
    <p class="promo__warning">Имеются противопоказания. Необходима консультация специалиста</p>
  </article>
</template>

<style lang="scss" scoped>
.promo {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  align-items: flex-start;
  height: 100%;
  padding: var(--sp-5);
  background: linear-gradient(160deg, var(--c-primary-soft), var(--c-surface) 60%);

  &__icon {
    display: grid;
    place-items: center;
    width: 3rem;
    height: 3rem;
    color: var(--c-on-accent);
    background: var(--c-accent);
    border-radius: 50%;
  }

  &__title {
    font-size: var(--fs-md);
  }

  &__text {
    flex: 1;
    color: var(--c-muted);
  }

  &__warning {
    align-self: stretch;
    padding: var(--sp-2) var(--sp-3);
    font-weight: 700;
    font-size: var(--fs-sm);
    text-align: center;
    text-transform: uppercase;
    border: 1px solid var(--c-border);
    border-radius: var(--r-sm);
  }

  &__date {
    display: flex;
    gap: var(--sp-2);
    align-items: center;
    font-weight: 700;
    font-size: var(--fs-sm);
  }
}
</style>
