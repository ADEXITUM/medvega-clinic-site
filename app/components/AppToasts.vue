<script setup lang="ts">
import { CircleAlert, CircleCheck, Info, X } from '@lucide/vue'

const { toasts, remove } = useToast()
const icons = { success: CircleCheck, error: CircleAlert, info: Info }
</script>

<template>
  <div class="toasts" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast">
      <div v-for="t in toasts" :key="t.id" :class="['toast', `toast--${t.type}`]" role="status">
        <component :is="icons[t.type]" :size="22" aria-hidden="true" class="toast__icon" />
        <p class="toast__text">{{ t.text }}</p>
        <button type="button" class="icon-btn toast__close" @click="remove(t.id)">
          <X :size="18" aria-hidden="true" />
          <span class="visually-hidden">Закрыть уведомление</span>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style lang="scss" scoped>
.toasts {
  position: fixed;
  top: calc(var(--header-h) + var(--sp-3));
  right: var(--sp-3);
  left: var(--sp-3);
  z-index: 300;
  display: grid;
  gap: var(--sp-2);
  pointer-events: none;

  @include up(md) {
    left: auto;
    width: 24rem;
  }
}

.toast {
  display: flex;
  gap: var(--sp-3);
  align-items: flex-start;
  padding: var(--sp-3) var(--sp-3) var(--sp-3) var(--sp-4);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-left: 5px solid var(--c-success);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-lg);
  pointer-events: auto;

  &--error {
    border-left-color: var(--c-error);
  }

  &--info {
    border-left-color: var(--c-primary);
  }

  &__icon {
    flex-shrink: 0;
    margin-top: 0.6rem;
    color: var(--c-success);
  }

  &--error &__icon {
    color: var(--c-error);
  }

  &--info &__icon {
    color: var(--c-primary);
  }

  &__text {
    flex: 1;
    padding-top: 0.5rem;
    font-size: var(--fs-sm);
  }

  &__close {
    flex-shrink: 0;
  }
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.25s,
    transform 0.25s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
