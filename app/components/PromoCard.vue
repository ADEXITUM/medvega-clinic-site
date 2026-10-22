<script setup lang="ts">
import { CalendarDays } from '@lucide/vue'
import type { Promo } from '~/types'

const props = defineProps<{ promo: Promo; headingLevel?: 'h2' | 'h3' }>()

// «Осталось N дней» считается в браузере: HTML страницы собран заранее
const daysLeft = ref<number | null>(null)
onMounted(() => {
  const ms = new Date(`${props.promo.until}T23:59:59`).getTime() - Date.now()
  daysLeft.value = Math.max(0, Math.ceil(ms / 86400000))
})
</script>

<template>
  <article class="promo card" data-testid="promo-card">
    <div class="promo__top">
      <span v-if="promo.badge" class="promo__badge">{{ promo.badge }}</span>
      <span v-if="daysLeft !== null && daysLeft <= 30" class="badge badge--warning">
        Осталось {{ daysLeft }} {{ plural(daysLeft, ['день', 'дня', 'дней']) }}
      </span>
    </div>
    <component :is="headingLevel ?? 'h3'" class="promo__title">{{ promo.title }}</component>
    <p class="promo__text">{{ promo.text }}</p>
    <p class="promo__date">
      <CalendarDays :size="18" aria-hidden="true" />
      до {{ formatDate(promo.until) }} г.
    </p>
    <NuxtLink :to="{ path: '/booking', query: { direction: promo.direction } }" class="btn btn--secondary btn--sm">
      Записаться<span class="visually-hidden"> по акции «{{ promo.title }}»</span>
    </NuxtLink>
    <!-- 38-ФЗ «О рекламе», ст. 24, ч. 7: предупреждение занимает не менее 5 % площади рекламы -->
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
  background: linear-gradient(160deg, var(--c-primary-soft), var(--c-surface) 55%);

  &__top {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-2);
    align-items: center;
  }

  &__badge {
    padding: 0.25rem 0.875rem;
    font-weight: 700;
    font-size: var(--fs-md);
    color: var(--c-on-accent);
    background: var(--c-accent);
    border-radius: var(--r-full);
  }

  &__title {
    font-size: var(--fs-md);
  }

  &__text {
    flex: 1;
    color: var(--c-muted);
  }

  &__date {
    display: flex;
    gap: var(--sp-2);
    align-items: center;
    font-weight: 700;
    font-size: var(--fs-sm);
  }

  &__warning {
    align-self: stretch;
    padding-top: var(--sp-3);
    font-size: var(--fs-sm);
    font-weight: 700;
    line-height: 1.35;
    color: var(--c-muted);
    border-top: 1px solid var(--c-border);
  }
}
</style>
