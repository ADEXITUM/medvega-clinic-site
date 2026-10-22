<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'

/** Аккордеон: кнопка-заголовок с aria-expanded управляет панелью */
const props = withDefaults(defineProps<{ title: string; level?: 'h2' | 'h3'; meta?: string }>(), { level: 'h3', meta: '' })
const open = defineModel<boolean>('open', { default: false })
const id = useId()
</script>

<template>
  <div :class="['acc', { 'acc--open': open }]">
    <component :is="props.level" class="acc__heading">
      <button
        :id="`${id}-btn`"
        type="button"
        class="acc__btn"
        :aria-expanded="open"
        :aria-controls="`${id}-panel`"
        @click="open = !open"
      >
        <span class="acc__title">{{ title }}</span>
        <span v-if="meta" class="acc__meta">{{ meta }}</span>
        <ChevronDown :size="22" aria-hidden="true" class="acc__chevron" />
      </button>
    </component>
    <div v-show="open" :id="`${id}-panel`" role="region" :aria-labelledby="`${id}-btn`" class="acc__panel">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.acc {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);

  & + & {
    margin-top: var(--sp-3);
  }

  &__heading {
    font-size: var(--fs-base);
  }

  &__btn {
    display: flex;
    gap: var(--sp-3);
    align-items: center;
    width: 100%;
    min-height: 3.5rem;
    padding: var(--sp-3) var(--sp-4);
    font-weight: 700;
    text-align: left;
    background: none;
    border: 0;
    border-radius: var(--r-md);
  }

  &__title {
    flex: 1;
  }

  &__meta {
    font-weight: 400;
    font-size: var(--fs-sm);
    color: var(--c-muted);
    text-align: right;

    @include up(md) {
      white-space: nowrap;
    }
  }

  &__chevron {
    flex-shrink: 0;
    color: var(--c-primary);
    transition: transform var(--transition);
  }

  &--open &__chevron {
    transform: rotate(180deg);
  }

  &__panel {
    padding: 0 var(--sp-4) var(--sp-4);
  }
}
</style>
