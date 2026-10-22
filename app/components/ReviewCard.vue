<script setup lang="ts">
import type { Review } from '~/types'

defineProps<{ review: Review; doctorName?: string; directionTitle?: string; headingLevel?: 'h2' | 'h3' }>()
</script>

<template>
  <article class="review card" data-testid="review-card">
    <header class="review__head">
      <component :is="headingLevel ?? 'h3'" class="review__author">{{ review.author }}</component>
      <span v-if="review.pending" class="badge badge--warning">На модерации</span>
    </header>
    <p class="review__rating"><StarRating :value="review.rating" /></p>
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
</style>
