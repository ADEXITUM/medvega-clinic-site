<script setup lang="ts">
import { ChevronLeft, ChevronRight } from '@lucide/vue'

const props = defineProps<{ page: number; pages: number }>()
const emit = defineEmits<{ change: [page: number] }>()

const go = (p: number) => {
  if (p >= 1 && p <= props.pages && p !== props.page) emit('change', p)
}
</script>

<template>
  <nav v-if="pages > 1" class="pager" aria-label="Страницы списка">
    <button type="button" class="icon-btn pager__btn" :disabled="page <= 1" @click="go(page - 1)">
      <ChevronLeft :size="20" aria-hidden="true" />
      <span class="visually-hidden">Предыдущая страница</span>
    </button>
    <ul class="pager__list">
      <li v-for="p in pages" :key="p">
        <button
          type="button"
          :class="['pager__btn', 'pager__num', { 'pager__num--current': p === page }]"
          :aria-current="p === page ? 'page' : undefined"
          @click="go(p)"
        >
          <span class="visually-hidden">Страница </span>{{ p }}
        </button>
      </li>
    </ul>
    <button type="button" class="icon-btn pager__btn" :disabled="page >= pages" @click="go(page + 1)">
      <ChevronRight :size="20" aria-hidden="true" />
      <span class="visually-hidden">Следующая страница</span>
    </button>
  </nav>
</template>

<style lang="scss" scoped>
.pager {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-1);
  align-items: center;
  justify-content: center;
  margin-top: var(--sp-6);

  &__list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-1);
  }

  &__btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &__num {
    min-width: var(--tap);
    height: var(--tap);
    font-weight: 700;
    background: var(--c-surface);
    border: 1px solid var(--c-border);
    border-radius: var(--r-md);

    &--current {
      color: var(--c-on-primary);
      background: var(--c-primary);
      border-color: var(--c-primary);
    }
  }
}
</style>
