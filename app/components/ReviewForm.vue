<script setup lang="ts">
import type { Direction, Doctor, Review } from '~/types'
import { addReview } from '~/services/api'

const props = defineProps<{ directions: Direction[]; doctors: Doctor[] }>()
const emit = defineEmits<{ added: [review: Review] }>()

const form = reactive({ author: '', direction: '', doctor: '', rating: 0, text: '', consent: false })
const errors = reactive({ author: '', direction: '', doctor: '', rating: '', text: '', consent: '' })
const touched = ref(false)
const sending = ref(false)

const doctorsOfDirection = computed(() => props.doctors.filter((d) => d.direction === form.direction))
watch(
  () => form.direction,
  () => (form.doctor = ''),
)

function validate() {
  errors.author = form.author.trim().length >= 2 ? '' : 'Укажите, как к вам обращаться'
  errors.direction = form.direction ? '' : 'Выберите направление'
  errors.doctor = form.doctor ? '' : 'Выберите врача'
  errors.rating = form.rating ? '' : 'Поставьте оценку от 1 до 5'
  errors.text = form.text.trim().length >= 20 ? '' : 'Напишите отзыв – не меньше 20 символов'
  errors.consent = form.consent ? '' : 'Без согласия на обработку персональных данных отправить отзыв нельзя'
  return Object.values(errors).every((e) => !e)
}
watch(form, () => touched.value && validate())

async function submit() {
  touched.value = true
  if (!validate()) {
    await nextTick()
    document.querySelector<HTMLElement>('.review-form [aria-invalid="true"]')?.focus()
    return
  }
  sending.value = true
  const review = await addReview({
    author: form.author.trim(),
    direction: form.direction,
    doctor: form.doctor,
    rating: form.rating,
    text: form.text.trim(),
  })
  sending.value = false
  touched.value = false
  Object.assign(form, { author: '', direction: '', doctor: '', rating: 0, text: '', consent: false })
  emit('added', review)
}
</script>

<template>
  <form class="form review-form" novalidate data-testid="review-form" @submit.prevent="submit">
    <FormField v-model="form.author" label="Ваше имя" required autocomplete="given-name" :error="errors.author" />
    <div class="form__row">
      <div class="field">
        <label for="rf-direction" class="field__label">Направление<span class="field__req" aria-hidden="true"> *</span></label>
        <select
          id="rf-direction"
          v-model="form.direction"
          class="field__control"
          required
          :aria-invalid="!!errors.direction"
          :aria-describedby="errors.direction ? 'rf-direction-err' : undefined"
        >
          <option value="" disabled>Выберите направление</option>
          <option v-for="d in directions" :key="d.slug" :value="d.slug">{{ d.title }}</option>
        </select>
        <p v-if="errors.direction" id="rf-direction-err" class="field__error">{{ errors.direction }}</p>
      </div>
      <div class="field">
        <label for="rf-doctor" class="field__label">Врач<span class="field__req" aria-hidden="true"> *</span></label>
        <select
          id="rf-doctor"
          v-model="form.doctor"
          class="field__control"
          required
          :disabled="!form.direction"
          :aria-invalid="!!errors.doctor"
          :aria-describedby="errors.doctor ? 'rf-doctor-err' : undefined"
        >
          <option value="" disabled>{{ form.direction ? 'Выберите врача' : 'Сначала выберите направление' }}</option>
          <option v-for="d in doctorsOfDirection" :key="d.slug" :value="d.slug">{{ d.name }}</option>
        </select>
        <p v-if="errors.doctor" id="rf-doctor-err" class="field__error">{{ errors.doctor }}</p>
      </div>
    </div>

    <fieldset class="rating" :aria-describedby="errors.rating ? 'rf-rating-err' : undefined">
      <legend class="field__label">Оценка<span class="field__req" aria-hidden="true"> *</span></legend>
      <div class="rating__options">
        <label v-for="n in 5" :key="n" class="rating__item">
          <input v-model="form.rating" type="radio" name="rating" :value="n" :aria-invalid="!!errors.rating" />
          <span>{{ n }}</span>
        </label>
      </div>
      <p v-if="errors.rating" id="rf-rating-err" class="field__error">{{ errors.rating }}</p>
    </fieldset>

    <FormField v-model="form.text" label="Отзыв" multiline required :error="errors.text" />
    <ConsentCheckbox v-model="form.consent" :error="errors.consent" />
    <button type="submit" class="btn btn--primary" :disabled="sending">{{ sending ? 'Отправляем…' : 'Отправить отзыв' }}</button>
    <p class="form__note">
      Отзыв появится на сайте после проверки администратором. Учебный сайт: отзыв сохраняется только в вашем браузере.
    </p>
  </form>
</template>

<style lang="scss" scoped>
.review-form {
  .btn {
    justify-self: start;
  }
}

.rating {
  margin: 0;
  padding: 0;
  border: 0;

  &__options {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-2);
    margin-top: var(--sp-2);
  }

  &__item {
    position: relative;

    input {
      position: absolute;
      opacity: 0;
    }

    span {
      display: grid;
      place-items: center;
      width: var(--tap);
      height: var(--tap);
      font-weight: 700;
      background: var(--c-surface);
      border: 2px solid var(--c-border);
      border-radius: var(--r-md);
      cursor: pointer;
    }

    input:checked + span {
      color: var(--c-on-primary);
      background: var(--c-primary);
      border-color: var(--c-primary);
    }

    input:focus-visible + span {
      @include focus-ring;
    }
  }
}
</style>
