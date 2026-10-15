<script setup lang="ts">
import { CircleAlert } from '@lucide/vue'

/**
 * Поле формы: подпись, само поле, подсказка и ошибка.
 * Ошибка выводится текстом под полем и связана с ним через aria-describedby.
 */
const props = withDefaults(
  defineProps<{
    label: string
    type?: string
    required?: boolean
    error?: string
    hint?: string
    multiline?: boolean
    autocomplete?: string
    inputmode?: 'text' | 'tel' | 'email' | 'search' | 'numeric'
    placeholder?: string
  }>(),
  { type: 'text', error: '', hint: '', autocomplete: 'off', inputmode: undefined, placeholder: '' },
)
const model = defineModel<string>({ required: true })
const emit = defineEmits<{ blur: []; input: [value: string] }>()

const id = useId()
const describedBy = computed(() => [props.hint && `${id}-hint`, props.error && `${id}-err`].filter(Boolean).join(' ') || undefined)

function onInput(e: Event) {
  const v = (e.target as HTMLInputElement).value
  model.value = v
  emit('input', v)
}
</script>

<template>
  <div class="field">
    <label :for="id" class="field__label">
      {{ label }}<span v-if="required" class="field__req" aria-hidden="true"> *</span>
    </label>
    <textarea
      v-if="multiline"
      :id="id"
      class="field__control"
      :value="model"
      :required="required"
      :aria-invalid="!!error"
      :aria-describedby="describedBy"
      :placeholder="placeholder"
      rows="4"
      @input="onInput"
      @blur="emit('blur')"
    />
    <input
      v-else
      :id="id"
      class="field__control"
      :type="type"
      :value="model"
      :required="required"
      :aria-required="required"
      :aria-invalid="!!error"
      :aria-describedby="describedBy"
      :autocomplete="autocomplete"
      :inputmode="inputmode"
      :placeholder="placeholder"
      @input="onInput"
      @blur="emit('blur')"
    />
    <p v-if="hint" :id="`${id}-hint`" class="field__hint">{{ hint }}</p>
    <p v-if="error" :id="`${id}-err`" class="field__error" role="alert">
      <CircleAlert :size="16" aria-hidden="true" class="field__error-icon" />
      <span>{{ error }}</span>
    </p>
  </div>
</template>

<style lang="scss" scoped>
.field__error-icon {
  flex-shrink: 0;
  margin-top: 0.2rem;
}
</style>
