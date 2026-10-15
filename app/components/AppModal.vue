<script setup lang="ts">
import { X } from '@lucide/vue'

/** Модальное окно: фокус переходит внутрь и удерживается в нём, закрывается по Esc и клику по подложке */
const props = defineProps<{ title: string }>()
const open = defineModel<boolean>({ required: true })

const dialog = ref<HTMLElement | null>(null)
const titleId = useId()
let lastFocus: HTMLElement | null = null

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])'

function onKey(e: KeyboardEvent) {
  if (!open.value) return
  if (e.key === 'Escape') open.value = false
  if (e.key === 'Tab' && dialog.value) {
    const items = [...dialog.value.querySelectorAll<HTMLElement>(FOCUSABLE)]
    if (!items.length) return
    const first = items[0]!
    const last = items[items.length - 1]!
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

watch(open, async (v) => {
  if (v) {
    lastFocus = document.activeElement as HTMLElement
    document.body.style.overflow = 'hidden'
    await nextTick()
    dialog.value?.querySelector<HTMLElement>('input, textarea, select, button:not(.modal__close)')?.focus()
  } else {
    document.body.style.overflow = ''
    lastFocus?.focus()
  }
})

onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal" @mousedown.self="open = false">
      <div ref="dialog" class="modal__dialog" role="dialog" aria-modal="true" :aria-labelledby="titleId">
        <div class="modal__head">
          <h2 :id="titleId" class="modal__title">{{ props.title }}</h2>
          <button type="button" class="icon-btn modal__close" @click="open = false">
            <X :size="24" aria-hidden="true" />
            <span class="visually-hidden">Закрыть окно</span>
          </button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  place-items: center;
  padding: var(--sp-4);
  overflow-y: auto;
  background: rgb(10 25 35 / 55%);

  &__dialog {
    width: min(100%, 30rem);
    padding: var(--sp-5);
    background: var(--c-surface);
    border: 1px solid var(--c-border);
    border-radius: var(--r-lg);
    box-shadow: var(--shadow-lg);
  }

  &__head {
    display: flex;
    gap: var(--sp-3);
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: var(--sp-4);
  }

  &__title {
    font-size: var(--fs-lg);
  }

  &__close {
    flex-shrink: 0;
    margin: calc(var(--sp-2) * -1);
  }
}
</style>
