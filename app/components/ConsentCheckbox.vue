<script setup lang="ts">
import { CircleAlert } from '@lucide/vue'

/** Обязательный чекбокс согласия на обработку персональных данных (152-ФЗ, ст. 9). По умолчанию не отмечен. */
defineProps<{ error?: string }>()
const model = defineModel<boolean>({ required: true })
const id = useId()
</script>

<template>
  <div class="consent">
    <div class="consent__row">
      <input
        :id="id"
        v-model="model"
        type="checkbox"
        class="consent__box"
        required
        :aria-invalid="!!error"
        :aria-describedby="error ? `${id}-err` : undefined"
        data-testid="consent"
      />
      <label :for="id" class="consent__label">
        Я даю согласие на обработку моих персональных данных в соответствии с
        <NuxtLink to="/privacy" target="_blank">политикой обработки персональных данных</NuxtLink>
      </label>
    </div>
    <p v-if="error" :id="`${id}-err`" class="field__error" role="alert">
      <CircleAlert :size="16" aria-hidden="true" />
      <span>{{ error }}</span>
    </p>
  </div>
</template>

<style lang="scss" scoped>
.consent {
  display: grid;
  gap: var(--sp-1);

  &__row {
    display: flex;
    gap: var(--sp-3);
    align-items: flex-start;
  }

  &__box {
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    margin: 0.1rem 0 0;
    accent-color: var(--c-primary);
    cursor: pointer;

    &[aria-invalid='true'] {
      outline: 2px solid var(--c-error);
      outline-offset: 2px;
    }
  }

  &__label {
    font-size: var(--fs-sm);
    cursor: pointer;
  }
}
</style>
