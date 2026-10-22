<script setup lang="ts">
/** Заглушка-скелетон на время загрузки данных: показывает форму будущего содержимого вместо текста «Загрузка…» */
withDefaults(defineProps<{ lines?: number; height?: string; chips?: number }>(), { lines: 0, height: '1rem', chips: 0 })
</script>

<template>
  <div class="skeleton" role="status" aria-label="Загрузка">
    <div v-if="chips" class="skeleton__chips">
      <span v-for="i in chips" :key="i" class="skeleton__chip" />
    </div>
    <span v-for="i in lines" :key="i" class="skeleton__line" :style="{ height, width: i === lines ? '60%' : '100%' }" />
  </div>
</template>

<style lang="scss" scoped>
.skeleton {
  display: grid;
  gap: var(--sp-2);

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-2);
  }

  &__chip,
  &__line {
    display: block;
    background: linear-gradient(90deg, var(--c-border) 0%, var(--c-bg) 50%, var(--c-border) 100%);
    background-size: 200% 100%;
    border-radius: var(--r-sm);
    animation: shimmer 1.2s infinite linear;
  }

  &__chip {
    width: 9rem;
    height: var(--tap);
    border-radius: var(--r-full);
  }
}

@keyframes shimmer {
  from {
    background-position: 200% 0;
  }

  to {
    background-position: -200% 0;
  }
}
</style>
