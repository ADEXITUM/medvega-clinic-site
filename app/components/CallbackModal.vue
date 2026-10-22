<script setup lang="ts">
import { requestCallback } from '~/services/api'

const open = useState('callback-open', () => false)
const { show } = useToast()

const form = reactive({ name: '', phone: '', time: 'now', consent: false })
const TIMES = [
  { value: 'now', label: 'Как можно скорее' },
  { value: 'morning', label: 'Утром, 8:00–12:00' },
  { value: 'day', label: 'Днём, 12:00–16:00' },
  { value: 'evening', label: 'Вечером, 16:00–20:00' },
]
const errors = reactive({ name: '', phone: '', consent: '' })
const sending = ref(false)

function validate() {
  errors.name = form.name.trim().length >= 2 ? '' : 'Укажите имя'
  errors.phone = isPhoneValid(form.phone) ? '' : 'Введите телефон полностью в формате +7 (999) 123-45-67'
  errors.consent = form.consent ? '' : 'Без согласия на обработку персональных данных отправить заявку нельзя'
  return !errors.name && !errors.phone && !errors.consent
}

async function submit() {
  if (!validate()) return
  sending.value = true
  await requestCallback({ name: form.name.trim(), phone: form.phone, time: form.time })
  sending.value = false
  open.value = false
  show(`Спасибо, ${form.name.trim()}! Администратор перезвонит вам в рабочее время.`)
  Object.assign(form, { name: '', phone: '', time: 'now', consent: false })
}

watch(open, (v) => {
  if (!v) Object.assign(errors, { name: '', phone: '', consent: '' })
})
</script>

<template>
  <AppModal v-model="open" title="Обратный звонок">
    <form class="form" novalidate data-testid="callback-form" @submit.prevent="submit">
      <p class="text-muted">Оставьте номер, и администратор перезвонит, чтобы ответить на вопросы и записать на приём.</p>
      <FormField v-model="form.name" label="Имя" required autocomplete="given-name" :error="errors.name" />
      <FormField
        v-model="form.phone"
        label="Телефон"
        type="tel"
        inputmode="tel"
        required
        autocomplete="tel"
        placeholder="+7 (___) ___-__-__"
        :error="errors.phone"
        @input="form.phone = formatPhone($event)"
      />
      <div class="field">
        <label for="cb-time" class="field__label">Когда удобно принять звонок</label>
        <select id="cb-time" v-model="form.time" class="field__control">
          <option v-for="t in TIMES" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>
      </div>
      <ConsentCheckbox v-model="form.consent" :error="errors.consent" />
      <button type="submit" class="btn btn--primary btn--block" :disabled="sending">
        {{ sending ? 'Отправляем…' : 'Жду звонка' }}
      </button>
      <p class="form__note">Учебный сайт: данные никуда не передаются, отправка имитируется.</p>
    </form>
  </AppModal>
</template>
