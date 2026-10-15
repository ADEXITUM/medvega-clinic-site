<script setup lang="ts">
import { Check } from '@lucide/vue'

const props = defineProps<{ steps: string[]; current: number; maxReached: number }>()
const emit = defineEmits<{ go: [step: number] }>()
</script>

<template>
  <nav class="progress" aria-label="Шаги записи">
    <p class="progress__mobile">Шаг {{ current }} из {{ steps.length }}: {{ steps[current - 1] }}</p>
    <div
      class="progress__bar"
      role="progressbar"
      aria-label="Прогресс записи"
      :aria-valuenow="current"
      aria-valuemin="1"
      :aria-valuemax="steps.length"
      :aria-valuetext="`Шаг ${current} из ${steps.length}`"
    >
      <span :style="{ width: `${(current / steps.length) * 100}%` }" />
    </div>
    <ol class="progress__list">
      <li
        v-for="(s, i) in steps"
        :key="s"
        :class="['progress__step', { 'progress__step--done': i + 1 < current, 'progress__step--current': i + 1 === current }]"
      >
        <button
          type="button"
          class="progress__btn"
          :disabled="i + 1 > props.maxReached || i + 1 === current"
          :aria-current="i + 1 === current ? 'step' : undefined"
          @click="emit('go', i + 1)"
        >
          <span class="progress__num">
            <Check v-if="i + 1 < current" :size="16" aria-hidden="true" />
            <template v-else>{{ i + 1 }}</template>
          </span>
          <span class="progress__label">{{ s }}</span>
        </button>
      </li>
    </ol>
  </nav>
</template>

<style lang="scss" scoped>
.progress {
  margin-bottom: var(--sp-5);

  &__mobile {
    margin-bottom: var(--sp-2);
    font-weight: 700;

    @include up(md) {
      @include visually-hidden;
    }
  }

  &__bar {
    height: 6px;
    overflow: hidden;
    background: var(--c-border);
    border-radius: var(--r-full);

    @include up(md) {
      display: none;
    }

    span {
      display: block;
      height: 100%;
      background: var(--c-primary);
      transition: width var(--transition);
    }
  }

  &__list {
    display: none;

    @include up(md) {
      display: flex;
      gap: var(--sp-2);
    }
  }

  &__step {
    flex: 1;
  }

  &__btn {
    display: flex;
    gap: var(--sp-2);
    align-items: center;
    width: 100%;
    min-height: var(--tap);
    padding: var(--sp-2);
    font-weight: 700;
    font-size: var(--fs-sm);
    color: var(--c-muted);
    text-align: left;
    background: none;
    border: 0;
    border-bottom: 3px solid var(--c-border);

    &:disabled {
      cursor: default;
    }
  }

  &__step--done &__btn {
    color: var(--c-text);
    border-color: var(--c-primary);
  }

  &__step--current &__btn {
    color: var(--c-primary);
    border-color: var(--c-primary);
  }

  &__num {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: 1.75rem;
    height: 1.75rem;
    color: var(--c-muted);
    background: var(--c-surface);
    border: 2px solid currentcolor;
    border-radius: 50%;
  }

  &__step--done &__num,
  &__step--current &__num {
    color: var(--c-on-primary);
    background: var(--c-primary);
    border-color: var(--c-primary);
  }
}
</style>
