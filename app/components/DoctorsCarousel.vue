<script setup lang="ts">
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import type { Direction, Doctor } from '~/types'

/** Карусель врачей на главной: горизонтальная прокрутка с привязкой (scroll-snap) и кнопки «назад/вперёд» */
const props = defineProps<{ doctors: Doctor[]; directions: Direction[] }>()
const track = ref<HTMLElement | null>(null)
const dirTitle = (slug: string) => props.directions.find((d) => d.slug === slug)?.title

function scroll(dir: 1 | -1) {
  const el = track.value
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: reduce ? 'auto' : 'smooth' })
}
</script>

<template>
  <div class="carousel" role="region" aria-roledescription="карусель" aria-label="Врачи клиники">
    <div class="carousel__controls">
      <button type="button" class="icon-btn carousel__btn" @click="scroll(-1)">
        <ChevronLeft :size="24" aria-hidden="true" /><span class="visually-hidden">Предыдущие врачи</span>
      </button>
      <button type="button" class="icon-btn carousel__btn" @click="scroll(1)">
        <ChevronRight :size="24" aria-hidden="true" /><span class="visually-hidden">Следующие врачи</span>
      </button>
    </div>
    <ul ref="track" class="carousel__track">
      <li v-for="d in doctors" :key="d.slug" class="carousel__item">
        <DoctorCard :doctor="d" :direction-title="dirTitle(d.direction)" />
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.carousel {
  position: relative;

  &__controls {
    display: flex;
    gap: var(--sp-2);
    justify-content: flex-end;
    margin-bottom: var(--sp-3);
  }

  &__btn {
    background: var(--c-surface);
    border: 1px solid var(--c-border);
  }

  &__track {
    display: grid;
    grid-auto-columns: 85%;
    grid-auto-flow: column;
    gap: var(--sp-4);
    padding-bottom: var(--sp-3);
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
    scrollbar-width: thin;

    @include up(md) {
      grid-auto-columns: calc((100% - var(--sp-4)) / 2);
    }

    @include up(lg) {
      grid-auto-columns: calc((100% - var(--sp-4) * 2) / 3);
    }

    @include up(xl) {
      grid-auto-columns: calc((100% - var(--sp-4) * 3) / 4);
    }
  }

  &__item {
    scroll-snap-align: start;
  }
}
</style>
