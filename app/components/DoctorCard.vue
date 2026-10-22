<script setup lang="ts">
import { Award, Baby, CalendarCheck, Star } from '@lucide/vue'
import type { Doctor, DoctorStats } from '~/types'

/** Карточка врача: стаж, рейтинг по отзывам, цена приёма и ближайшая свободная дата */
const props = defineProps<{ doctor: Doctor; directionTitle?: string; stats?: DoctorStats; next?: string | null }>()
const nextLabel = computed(() => (props.next ? relativeDay(props.next) : null))
</script>

<template>
  <article class="doctor card" data-testid="doctor-card">
    <div class="doctor__head">
      <DoctorAvatar :name="doctor.name" :direction="doctor.direction" />
      <p v-if="stats?.rating" class="doctor__rating" :title="`Рейтинг по ${stats.reviews} отзывам`">
        <Star :size="16" aria-hidden="true" class="doctor__star" />
        <strong>{{ formatRating(stats.rating) }}</strong>
        <span class="visually-hidden">из 5,</span>
        <span class="doctor__reviews">{{ stats.reviews }} {{ plural(stats.reviews, ['отзыв', 'отзыва', 'отзывов']) }}</span>
      </p>
    </div>
    <div class="doctor__body">
      <h3 class="doctor__name">
        <NuxtLink :to="`/doctors/${doctor.slug}`" class="doctor__link">{{ doctor.name }}</NuxtLink>
      </h3>
      <p class="doctor__position">{{ doctor.position }}</p>
      <ul class="doctor__meta">
        <li><Award :size="16" aria-hidden="true" /> Стаж {{ experienceText(doctor.experience) }}, {{ doctor.category.toLowerCase() }}</li>
        <li v-if="doctor.children"><Baby :size="16" aria-hidden="true" /> Принимает детей</li>
      </ul>
      <span v-if="props.directionTitle" class="badge">{{ props.directionTitle }}</span>
    </div>
    <div class="doctor__foot">
      <p v-if="stats" class="doctor__price">Приём от <strong>{{ formatPrice(stats.priceFrom) }}</strong></p>
      <!-- место под строку резервируется заранее: дата приходит после загрузки и не должна сдвигать вёрстку -->
      <p v-if="stats" class="doctor__next" :class="{ 'doctor__next--pending': !nextLabel }" data-testid="doctor-next">
        <template v-if="nextLabel"><CalendarCheck :size="16" aria-hidden="true" /> Ближайшая запись: {{ nextLabel }}</template>
      </p>
      <NuxtLink
        :to="{ path: '/booking', query: { direction: doctor.direction, doctor: doctor.slug } }"
        class="btn btn--primary btn--sm doctor__cta"
      >
        Записаться<span class="visually-hidden"> к врачу {{ doctor.name }}</span>
      </NuxtLink>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.doctor {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  height: 100%;
  padding: var(--sp-5);
  transition: box-shadow var(--transition);

  &:hover {
    box-shadow: var(--shadow-md);
  }

  &__head {
    display: flex;
    gap: var(--sp-3);
    align-items: flex-start;
    justify-content: space-between;
  }

  &__rating {
    display: inline-flex;
    gap: var(--sp-1);
    align-items: center;
    padding: 0.25rem 0.625rem;
    font-size: var(--fs-sm);
    background: var(--c-warning-soft);
    border-radius: var(--r-full);
  }

  &__star {
    color: #b45309;
    fill: #f59e0b;
  }

  &__reviews {
    color: var(--c-muted);
  }

  &__body {
    display: grid;
    flex: 1;
    gap: var(--sp-2);
    align-content: start;
    justify-items: start;
  }

  &__name {
    font-size: var(--fs-md);
  }

  &__link {
    color: var(--c-text);
    text-decoration: none;

    &:hover {
      color: var(--c-primary);
      text-decoration: underline;
    }
  }

  &__position {
    color: var(--c-muted);
  }

  &__meta {
    display: grid;
    gap: var(--sp-1);
    font-size: var(--fs-sm);
    color: var(--c-muted);

    li {
      display: flex;
      gap: var(--sp-1);
      align-items: flex-start;
    }

    svg {
      flex-shrink: 0;
      margin-top: 0.2rem;
    }
  }

  &__foot {
    display: grid;
    gap: var(--sp-2);
    padding-top: var(--sp-3);
    border-top: 1px solid var(--c-border);
  }

  &__price {
    font-size: var(--fs-sm);
    color: var(--c-muted);

    strong {
      color: var(--c-text);
    }
  }

  &__next {
    display: flex;
    gap: var(--sp-1);
    align-items: center;
    min-height: calc(var(--fs-sm) * 1.6 * 2);
    font-size: var(--fs-sm);
    color: var(--c-success);
  }

  &__cta {
    justify-self: start;
  }
}

html[data-scheme]:not([data-scheme='default']) .doctor__star {
  color: var(--c-text);
  fill: var(--c-text);
}
</style>
