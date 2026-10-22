<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'
import type { Direction } from '~/types'
import { directionPrice } from '~/services/api'

const props = defineProps<{ direction: Direction }>()
// цена приёма, а не самой дешёвой процедуры: «от 350 ₽» за инъекцию вводило бы в заблуждение
const price = computed(() => directionPrice(props.direction.slug))
</script>

<template>
  <article class="dir card">
    <div class="dir__icon"><DirectionIcon :name="direction.icon" /></div>
    <h3 class="dir__title">
      <NuxtLink :to="`/services/${direction.slug}`" class="dir__link">{{ direction.title }}</NuxtLink>
    </h3>
    <p class="dir__text">{{ direction.short }}</p>
    <p class="dir__price">
      <span class="dir__price-label">{{ price.isVisit ? 'Приём от' : 'от' }}</span> {{ formatPrice(price.price) }}
    </p>
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
  padding: var(--sp-4);
  transition:
    box-shadow var(--transition),
    border-color var(--transition),
    transform var(--transition);

  @include up(md) {
    padding: var(--sp-5);
  }

  &:hover,
  &:focus-within {
    border-color: var(--c-primary);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  &__icon {
    display: grid;
    place-items: center;
    width: 3rem;
    height: 3rem;
    margin-bottom: var(--sp-1);
    color: var(--c-primary);
    background: var(--c-primary-soft);
    border-radius: var(--r-md);
  }

  &__title {
    font-size: var(--fs-base);

    @include up(md) {
      font-size: var(--fs-md);
    }
  }

  // вся карточка кликабельна за счёт растянутой ссылки
  &__link {
    color: var(--c-text);
    text-decoration: none;
    hyphens: auto;

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

  // на телефоне карточки идут в две колонки, поэтому описание скрыто
  &__text {
    display: none;
    flex: 1;
    font-size: var(--fs-sm);
    color: var(--c-muted);

    @include up(md) {
      display: block;
    }
  }

  &__price {
    margin-top: auto;
    font-weight: 700;
    font-size: var(--fs-sm);
    color: var(--c-primary);

    @include up(md) {
      font-size: var(--fs-base);
    }
  }

  &__price-label {
    font-weight: 400;
    color: var(--c-muted);
  }

  &__arrow {
    display: none;
    align-self: flex-end;
    color: var(--c-primary);

    @include up(md) {
      display: block;
    }
  }
}
</style>
