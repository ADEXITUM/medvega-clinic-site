<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'
import type { Direction } from '~/types'

defineProps<{ direction: Direction; priceFrom?: number }>()
</script>

<template>
  <article class="dir card">
    <div class="dir__icon"><DirectionIcon :name="direction.icon" /></div>
    <h3 class="dir__title">
      <NuxtLink :to="`/services/${direction.slug}`" class="dir__link">{{ direction.title }}</NuxtLink>
    </h3>
    <p class="dir__text">{{ direction.short }}</p>
    <p v-if="priceFrom" class="dir__price">от {{ formatPrice(priceFrom) }}</p>
    <ArrowRight :size="20" aria-hidden="true" class="dir__arrow" />
  </article>
</template>

<style lang="scss" scoped>
.dir {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  height: 100%;
  padding: var(--sp-5);
  transition:
    box-shadow var(--transition),
    border-color var(--transition);

  &:hover,
  &:focus-within {
    border-color: var(--c-primary);
    box-shadow: var(--shadow-md);
  }

  &__icon {
    display: grid;
    place-items: center;
    width: 3.25rem;
    height: 3.25rem;
    margin-bottom: var(--sp-2);
    color: var(--c-primary);
    background: var(--c-primary-soft);
    border-radius: var(--r-md);
  }

  &__title {
    font-size: var(--fs-md);
  }

  // вся карточка кликабельна за счёт растянутой ссылки
  &__link {
    color: var(--c-text);
    text-decoration: none;

    &::after {
      position: absolute;
      inset: 0;
      content: '';
      border-radius: var(--r-lg);
    }

    &:focus-visible {
      outline: none;

      &::after {
        @include focus-ring;
      }
    }
  }

  &__text {
    flex: 1;
    font-size: var(--fs-sm);
    color: var(--c-muted);
  }

  &__price {
    font-weight: 700;
    color: var(--c-primary);
  }

  &__arrow {
    align-self: flex-end;
    color: var(--c-primary);
  }
}
</style>
