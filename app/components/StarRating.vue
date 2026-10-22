<script setup lang="ts">
/**
 * Рейтинг звёздами одной текстовой строкой: серые «★★★★★» и поверх – цветные, обрезанные по доле оценки.
 * Вместо пяти SVG-иконок в каждой карточке – несколько байт разметки.
 */
const props = defineProps<{ value: number }>()
const width = computed(() => `${(props.value / 5) * 100}%`)
</script>

<template>
  <span class="stars" role="img" :aria-label="`Оценка ${value} из 5`">
    <span class="stars__base" aria-hidden="true">★★★★★</span>
    <span class="stars__fill" :style="{ width }" aria-hidden="true">★★★★★</span>
  </span>
</template>

<style lang="scss" scoped>
.stars {
  position: relative;
  display: inline-block;
  font-size: 1.125rem;
  line-height: 1;
  letter-spacing: 2px;
  white-space: nowrap;

  &__base {
    color: var(--c-border);
  }

  &__fill {
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    color: #f59e0b;
  }
}

html[data-scheme]:not([data-scheme='default']) .stars__fill {
  color: var(--c-text);
}
</style>
