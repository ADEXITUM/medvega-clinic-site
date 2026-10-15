<script setup lang="ts">
import { ArrowLeft, CalendarDays, CircleCheck, Clock, User } from '@lucide/vue'
import type { Booking, Slot } from '~/types'
import { createBooking, getDirections, getDoctors, getSlots, getWorkingDays } from '~/services/api'

usePageSeo({
  title: 'Онлайн-запись к врачу',
  description: 'Запишитесь к врачу клиники «МедВега» онлайн: выберите направление, специалиста, дату и свободное время.',
})

const [{ data: directions }, { data: doctors }] = await Promise.all([
  useAsyncData('directions', getDirections),
  useAsyncData('doctors', () => getDoctors()),
])

const STEPS = ['Направление', 'Врач', 'Дата', 'Время', 'Ваши данные']
const step = ref(1)
const maxReached = ref(1)

const choice = reactive({ direction: '', doctor: '', date: '', time: '' })
const form = reactive({ name: '', phone: '', email: '', comment: '', consent: false })
const errors = reactive({ name: '', phone: '', email: '', consent: '' })
const touched = ref(false)

const days = ref<{ date: string; working: boolean }[]>([])
const slots = ref<Slot[]>([])
const loading = ref(false)
const sending = ref(false)
const submitError = ref('')
const done = ref<Booking | null>(null)

const doctorsOfDirection = computed(() => (doctors.value ?? []).filter((d) => d.direction === choice.direction))
const selectedDirection = computed(() => directions.value?.find((d) => d.slug === choice.direction))
const selectedDoctor = computed(() => doctors.value?.find((d) => d.slug === choice.doctor))

const stepHeading = ref<HTMLElement | null>(null)

async function goTo(n: number) {
  step.value = n
  maxReached.value = Math.max(maxReached.value, n)
  if (n === 3) await loadDays()
  if (n === 4) await loadSlots()
  await nextTick()
  stepHeading.value?.focus()
}

async function loadDays() {
  loading.value = true
  days.value = await getWorkingDays(choice.doctor)
  loading.value = false
}

async function loadSlots() {
  loading.value = true
  slots.value = await getSlots(choice.doctor, choice.date)
  loading.value = false
}

function pickDirection(slug: string) {
  if (choice.direction !== slug) Object.assign(choice, { direction: slug, doctor: '', date: '', time: '' })
  maxReached.value = 2
  goTo(2)
}
function pickDoctor(slug: string) {
  if (choice.doctor !== slug) Object.assign(choice, { doctor: slug, date: '', time: '' })
  maxReached.value = 3
  goTo(3)
}
function pickDate(date: string) {
  if (choice.date !== date) Object.assign(choice, { date, time: '' })
  maxReached.value = 4
  goTo(4)
}
function pickTime(time: string) {
  choice.time = time
  goTo(5)
}

// Проверка полей пятого шага. Ошибки показываются текстом под полем
function validate() {
  errors.name = !form.name.trim()
    ? 'Укажите фамилию, имя и отчество'
    : isNameValid(form.name)
      ? ''
      : 'Укажите фамилию и имя полностью, только буквами'
  errors.phone = !form.phone
    ? 'Укажите номер телефона'
    : isPhoneValid(form.phone)
      ? ''
      : 'Введите телефон полностью в формате +7 (999) 123-45-67'
  errors.email = form.email && !isEmailValid(form.email) ? 'Проверьте адрес электронной почты, например name@mail.ru' : ''
  errors.consent = form.consent ? '' : 'Без согласия на обработку персональных данных записаться нельзя'
  return !errors.name && !errors.phone && !errors.email && !errors.consent
}
watch(form, () => touched.value && validate())

async function submit() {
  touched.value = true
  submitError.value = ''
  if (!validate()) {
    await nextTick()
    document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    return
  }
  sending.value = true
  try {
    done.value = await createBooking({
      direction: choice.direction,
      doctor: choice.doctor,
      date: choice.date,
      time: choice.time,
      name: form.name.trim(),
      phone: form.phone,
      email: form.email.trim() || undefined,
      comment: form.comment.trim() || undefined,
    })
    window.scrollTo({ top: 0 })
    await nextTick()
    document.getElementById('done-title')?.focus()
  } catch (e) {
    submitError.value = (e as Error).message
    choice.time = ''
    await goTo(4)
  } finally {
    sending.value = false
  }
}

function restart() {
  Object.assign(choice, { direction: '', doctor: '', date: '', time: '' })
  Object.assign(form, { name: '', phone: '', email: '', comment: '', consent: false })
  touched.value = false
  done.value = null
  maxReached.value = 1
  goTo(1)
}

/**
 * Переход со страницы врача или направления: ?direction=…&doctor=…&date=…&time=…
 * Мастер открывается на первом невыбранном шаге.
 */
const route = useRoute()
onMounted(async () => {
  const q = route.query
  const dir = typeof q.direction === 'string' ? q.direction : ''
  const doc = typeof q.doctor === 'string' ? q.doctor : ''
  if (!dir || !directions.value?.some((d) => d.slug === dir)) return
  choice.direction = dir
  if (!doc || !doctorsOfDirection.value.some((d) => d.slug === doc)) return void (maxReached.value = 2, (step.value = 2))
  choice.doctor = doc
  await loadDays()
  const date = typeof q.date === 'string' ? q.date : ''
  if (!days.value.some((d) => d.date === date && d.working)) return void (maxReached.value = 3, (step.value = 3))
  choice.date = date
  await loadSlots()
  const time = typeof q.time === 'string' ? q.time : ''
  if (!slots.value.some((s) => s.time === time && s.free)) return void (maxReached.value = 4, (step.value = 4))
  choice.time = time
  maxReached.value = 5
  step.value = 5
})
</script>

<template>
  <div class="container page booking">
    <AppBreadcrumbs :items="[{ label: 'Онлайн-запись' }]" />

    <!-- экран «Вы записаны» -->
    <section v-if="done" class="done card" aria-labelledby="done-title" data-testid="booking-done">
      <CircleCheck :size="56" aria-hidden="true" class="done__icon" />
      <h1 id="done-title" class="done__title" tabindex="-1">Вы записаны!</h1>
      <p class="lead">Ждём вас в клинике. Если планы изменятся, отмените запись в разделе «Мои записи».</p>
      <dl class="summary">
        <div><dt>Номер записи</dt><dd>{{ done.id }}</dd></div>
        <div><dt>Направление</dt><dd>{{ selectedDirection?.title }}</dd></div>
        <div><dt>Врач</dt><dd>{{ selectedDoctor?.name }}</dd></div>
        <div><dt>Дата и время</dt><dd>{{ formatDayShort(done.date).full }}, {{ done.time }}</dd></div>
        <div><dt>Пациент</dt><dd>{{ done.name }}</dd></div>
        <div><dt>Телефон</dt><dd>{{ done.phone }}</dd></div>
      </dl>
      <div class="done__actions">
        <NuxtLink to="/my" class="btn btn--primary">Мои записи</NuxtLink>
        <button type="button" class="btn btn--secondary" @click="restart">Записаться ещё</button>
      </div>
    </section>

    <template v-else>
      <h1 class="page__title">Онлайн-запись к врачу</h1>
      <BookingProgress :steps="STEPS" :current="step" :max-reached="maxReached" @go="goTo" />

      <div class="booking__layout">
        <section class="booking__step" :aria-labelledby="`step-${step}-title`" data-testid="booking-step" :data-step="step">
          <!-- Шаг 1 -->
          <template v-if="step === 1">
            <h2 :id="`step-1-title`" ref="stepHeading" tabindex="-1" class="booking__title">Выберите направление</h2>
            <ul class="options options--grid">
              <li v-for="d in directions" :key="d.slug">
                <button
                  type="button"
                  :class="['option', { 'option--active': choice.direction === d.slug }]"
                  :aria-pressed="choice.direction === d.slug"
                  :data-testid="`dir-${d.slug}`"
                  @click="pickDirection(d.slug)"
                >
                  <DirectionIcon :name="d.icon" :size="24" />
                  <span>{{ d.title }}</span>
                </button>
              </li>
            </ul>
          </template>

          <!-- Шаг 2 -->
          <template v-else-if="step === 2">
            <h2 :id="`step-2-title`" ref="stepHeading" tabindex="-1" class="booking__title">Выберите врача</h2>
            <ul class="options">
              <li v-for="d in doctorsOfDirection" :key="d.slug">
                <button
                  type="button"
                  :class="['option', 'option--doctor', { 'option--active': choice.doctor === d.slug }]"
                  :aria-pressed="choice.doctor === d.slug"
                  :data-testid="`doc-${d.slug}`"
                  @click="pickDoctor(d.slug)"
                >
                  <DoctorAvatar :name="d.name" :direction="d.direction" />
                  <span class="option__text">
                    <strong>{{ d.name }}</strong>
                    <span class="text-muted text-small">{{ d.position }}, стаж {{ experienceText(d.experience) }}</span>
                  </span>
                </button>
              </li>
            </ul>
          </template>

          <!-- Шаг 3 -->
          <template v-else-if="step === 3">
            <h2 :id="`step-3-title`" ref="stepHeading" tabindex="-1" class="booking__title">Выберите дату</h2>
            <p class="text-muted text-small">Запись открыта на 14 дней вперёд. Недоступные даты – выходные дни врача.</p>
            <p v-if="loading" class="text-muted">Загружаем расписание…</p>
            <ul v-else class="calendar" data-testid="calendar">
              <li v-for="d in days" :key="d.date">
                <button
                  type="button"
                  :class="['day', { 'day--active': choice.date === d.date }]"
                  :disabled="!d.working"
                  :aria-pressed="choice.date === d.date"
                  :aria-label="`${formatDayShort(d.date).full}${d.working ? '' : ', врач не принимает'}`"
                  :data-date="d.date"
                  @click="pickDate(d.date)"
                >
                  <span class="day__wd">{{ formatDayShort(d.date).weekday }}</span>
                  <span class="day__num">{{ formatDayShort(d.date).day }}</span>
                  <span class="day__month">{{ formatDayShort(d.date).month.slice(0, 3) }}</span>
                </button>
              </li>
            </ul>
          </template>

          <!-- Шаг 4 -->
          <template v-else-if="step === 4">
            <h2 :id="`step-4-title`" ref="stepHeading" tabindex="-1" class="booking__title">Выберите время</h2>
            <p class="text-muted text-small">{{ formatDayShort(choice.date).full }}. Приём длится 30 минут, занятое время недоступно.</p>
            <p v-if="submitError" class="field__error" role="alert">{{ submitError }}</p>
            <p v-if="loading" class="text-muted">Загружаем свободное время…</p>
            <ul v-else-if="slots.some((s) => s.free)" class="slots" data-testid="slots">
              <li v-for="s in slots" :key="s.time">
                <button
                  type="button"
                  :class="['slot', { 'slot--active': choice.time === s.time }]"
                  :disabled="!s.free"
                  :aria-pressed="choice.time === s.time"
                  :aria-label="s.free ? s.time : `${s.time}, занято`"
                  :data-time="s.time"
                  @click="pickTime(s.time)"
                >
                  {{ s.time }}
                </button>
              </li>
            </ul>
            <p v-else class="notice">На этот день свободного времени нет. Выберите другую дату.</p>
          </template>

          <!-- Шаг 5 -->
          <template v-else>
            <h2 :id="`step-5-title`" ref="stepHeading" tabindex="-1" class="booking__title">Ваши данные</h2>
            <form class="form" novalidate data-testid="booking-form" @submit.prevent="submit">
              <FormField
                v-model="form.name"
                label="Фамилия, имя, отчество"
                required
                autocomplete="name"
                placeholder="Иванов Иван Иванович"
                :error="errors.name"
              />
              <div class="form__row">
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
                <FormField
                  v-model="form.email"
                  label="Электронная почта"
                  type="email"
                  inputmode="email"
                  autocomplete="email"
                  hint="Необязательно. Пришлём напоминание о приёме."
                  :error="errors.email"
                />
              </div>
              <FormField v-model="form.comment" label="Комментарий" multiline hint="Например, что беспокоит или удобный способ связи" />
              <ConsentCheckbox v-model="form.consent" :error="errors.consent" />
              <button type="submit" class="btn btn--primary booking__submit" :disabled="sending" data-testid="booking-submit">
                {{ sending ? 'Записываем…' : 'Записаться' }}
              </button>
              <p class="form__note">
                Учебный сайт: данные никуда не передаются и хранятся только в вашем браузере. Отправка имитируется.
              </p>
            </form>
          </template>

          <button v-if="step > 1" type="button" class="btn btn--text booking__back" @click="goTo(step - 1)">
            <ArrowLeft :size="18" aria-hidden="true" /> Назад
          </button>
        </section>

        <aside v-if="choice.direction" class="booking__aside card" aria-label="Выбранные параметры записи">
          <h2 class="booking__aside-title">Ваша запись</h2>
          <dl class="summary summary--compact">
            <div><dt>Направление</dt><dd>{{ selectedDirection?.title }}</dd></div>
            <div v-if="selectedDoctor">
              <dt><User :size="16" aria-hidden="true" /> Врач</dt>
              <dd>{{ selectedDoctor.name }}</dd>
            </div>
            <div v-if="choice.date">
              <dt><CalendarDays :size="16" aria-hidden="true" /> Дата</dt>
              <dd>{{ formatDayShort(choice.date).full }}</dd>
            </div>
            <div v-if="choice.time">
              <dt><Clock :size="16" aria-hidden="true" /> Время</dt>
              <dd>{{ choice.time }}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.booking {
  &__layout {
    display: grid;
    gap: var(--sp-5);

    @include up(lg) {
      grid-template-columns: minmax(0, 1fr) 20rem;
      align-items: start;
    }
  }

  &__step {
    display: grid;
    gap: var(--sp-4);
    align-content: start;
  }

  &__title {
    font-size: var(--fs-lg);

    &:focus {
      outline: none;
    }
  }

  &__back {
    justify-self: start;
  }

  &__submit {
    justify-self: start;
    min-width: 12rem;
  }

  &__aside {
    padding: var(--sp-5);

    @include up(lg) {
      position: sticky;
      top: calc(var(--header-h) + var(--sp-4));
    }
  }

  &__aside-title {
    margin-bottom: var(--sp-3);
    font-size: var(--fs-md);
  }
}

.options {
  display: grid;
  gap: var(--sp-3);

  &--grid {
    @include up(sm) {
      grid-template-columns: repeat(auto-fill, minmax(min(14rem, 100%), 1fr));
    }
  }
}

.option {
  display: flex;
  gap: var(--sp-3);
  align-items: center;
  width: 100%;
  min-height: 3.5rem;
  padding: var(--sp-3) var(--sp-4);
  font-weight: 700;
  text-align: left;
  color: var(--c-text);
  background: var(--c-surface);
  border: 2px solid var(--c-border);
  border-radius: var(--r-md);
  transition: border-color var(--transition);

  svg {
    flex-shrink: 0;
    color: var(--c-primary);
  }

  &:hover {
    border-color: var(--c-primary);
  }

  &--active {
    border-color: var(--c-primary);
    background: var(--c-primary-soft);
  }

  &__text {
    display: grid;
    gap: 2px;
  }
}

.calendar {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(4.5rem, 1fr));
  gap: var(--sp-2);
}

.day {
  display: grid;
  justify-items: center;
  width: 100%;
  min-height: 5rem;
  padding: var(--sp-2);
  color: var(--c-text);
  background: var(--c-surface);
  border: 2px solid var(--c-border);
  border-radius: var(--r-md);

  &:hover:not(:disabled) {
    border-color: var(--c-primary);
  }

  &:disabled {
    color: var(--c-muted);
    background: repeating-linear-gradient(-45deg, var(--c-bg), var(--c-bg) 6px, var(--c-surface) 6px, var(--c-surface) 12px);
    cursor: not-allowed;
    opacity: 0.7;
  }

  &--active {
    color: var(--c-on-primary);
    background: var(--c-primary);
    border-color: var(--c-primary);
  }

  &__wd,
  &__month {
    font-size: var(--fs-xs);
  }

  &__num {
    font-weight: 700;
    font-size: var(--fs-lg);
  }
}

.slots {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(5.5rem, 1fr));
  gap: var(--sp-2);
}

.slot {
  width: 100%;
  min-height: var(--tap);
  font-weight: 700;
  color: var(--c-text);
  background: var(--c-surface);
  border: 2px solid var(--c-primary);
  border-radius: var(--r-sm);

  &:hover:not(:disabled) {
    background: var(--c-primary-soft);
  }

  &:disabled {
    color: var(--c-muted);
    text-decoration: line-through;
    background: var(--c-bg);
    border-color: var(--c-border);
    cursor: not-allowed;
  }

  &--active {
    color: var(--c-on-primary);
    background: var(--c-primary);
  }
}

.summary {
  display: grid;
  gap: var(--sp-3);

  @include up(md) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  dt {
    display: flex;
    gap: var(--sp-1);
    align-items: center;
    font-size: var(--fs-sm);
    color: var(--c-muted);
  }

  dd {
    margin: 0;
    font-weight: 700;
  }

  &--compact {
    grid-template-columns: 1fr;
  }
}

.done {
  display: grid;
  gap: var(--sp-4);
  justify-items: start;
  max-width: 48rem;
  padding: var(--sp-5);

  @include up(md) {
    padding: var(--sp-7);
  }

  &__icon {
    color: var(--c-success);
  }

  &__title:focus {
    outline: none;
  }

  .summary {
    width: 100%;
    padding: var(--sp-4);
    background: var(--c-bg);
    border-radius: var(--r-md);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-3);
  }
}
</style>
