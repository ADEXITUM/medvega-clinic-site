<script setup lang="ts">
import { Star } from '@lucide/vue'
import type { Review } from '~/types'

defineProps<{ review: Review; doctorName?: string; directionTitle?: string; headingLevel?: 'h2' | 'h3' }>()
</script>

<template>
  <article class="review card" data-testid="review-card">
    <header class="review__head">
      <component :is="headingLevel ?? 'h3'" class="review__author">{{ review.author }}</component>
      <span v-if="review.pending" class="badge badge--warning">На модерации</span>
    </header>
    <p class="review__rating">
      <span class="visually-hidden">Оценка {{ review.rating }} из 5</span>
      <Star
        v-for="i in 5"
        :key="i"
        :size="18"
        aria-hidden="true"
        :class="['review__star', { 'review__star--on': i <= review.rating }]"
      />
    </p>
    <p class="review__text">{{ review.text }}</p>
    <footer class="review__meta">
      <span v-if="doctorName">
        Врач: <NuxtLink :to="`/doctors/${review.doctor}`">{{ doctorName }}</NuxtLink>
      </span>
      <span v-if="directionTitle">{{ directionTitle }}</span>
      <time :datetime="review.date">{{ formatDate(review.date) }}</time>
    </footer>
  </article>
</template>

<style lang="scss" scoped>
.review {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  height: 100%;
  padding: var(--sp-5);

  &__head {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-2);
    align-items: center;
    justify-content: space-between;
  }

  &__author {
    font-size: var(--fs-md);
  }

  &__rating {
    display: flex;
    gap: 2px;
  }

  &__star {
    color: var(--c-border);

    &--on {
      color: #d97706;
      fill: #f59e0b;
    }
  }

  &__text {
    flex: 1;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-1) var(--sp-4);
    font-size: var(--fs-sm);
    color: var(--c-muted);
  }
}

html[data-scheme]:not([data-scheme='default']) .review__star--on {
  color: var(--c-text);
  fill: var(--c-text);
}
</style>
