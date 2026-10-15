<script setup lang="ts">
import { Award, Baby } from '@lucide/vue'
import type { Doctor } from '~/types'

const props = defineProps<{ doctor: Doctor; directionTitle?: string }>()
</script>

<template>
  <article class="doctor card" data-testid="doctor-card">
    <DoctorAvatar :name="doctor.name" :direction="doctor.direction" />
    <div class="doctor__body">
      <h3 class="doctor__name">
        <NuxtLink :to="`/doctors/${doctor.slug}`" class="doctor__link">{{ doctor.name }}</NuxtLink>
      </h3>
      <p class="doctor__position">{{ doctor.position }}</p>
      <ul class="doctor__meta">
        <li><Award :size="16" aria-hidden="true" /> Стаж {{ experienceText(doctor.experience) }}</li>
        <li>{{ doctor.category }}</li>
        <li v-if="doctor.children"><Baby :size="16" aria-hidden="true" /> Принимает детей</li>
      </ul>
      <span v-if="props.directionTitle" class="badge">{{ props.directionTitle }}</span>
    </div>
    <NuxtLink
      :to="{ path: '/booking', query: { direction: doctor.direction, doctor: doctor.slug } }"
      class="btn btn--primary btn--sm doctor__cta"
    >
      Записаться<span class="visually-hidden"> к врачу {{ doctor.name }}</span>
    </NuxtLink>
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
      align-items: center;
    }
  }

  &__cta {
    align-self: flex-start;
  }
}
</style>
