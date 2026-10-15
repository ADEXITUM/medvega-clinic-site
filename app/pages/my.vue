<script setup lang="ts">
import { CalendarDays, Clock, User } from '@lucide/vue'
import type { Booking } from '~/types'
import { cancelBooking, getBookings, getDirections, getDoctors, toIsoDate } from '~/services/api'

usePageSeo({ title: 'Мои записи', description: 'Записи к врачам клиники «МедВега», сделанные в этом браузере. Отмена записи онлайн.' })
useSeoMeta({ robots: 'noindex, follow' })

const [{ data: directions }, { data: doctors }] = await Promise.all([
  useAsyncData('directions', getDirections),
  useAsyncData('doctors', () => getDoctors()),
])

// Записи хранятся в localStorage, поэтому читаются только в браузере
const bookings = ref<Booking[] | null>(null)
onMounted(async () => {
  bookings.value = await getBookings()
})

const today = toIsoDate(new Date())
const upcoming = computed(() =>
  (bookings.value ?? [])
    .filter((b) => b.status === 'active' && b.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
)
const past = computed(() =>
  (bookings.value ?? [])
    .filter((b) => b.status === 'cancelled' || b.date < today)
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)),
)

const docName = (slug: string) => doctors.value?.find((d) => d.slug === slug)?.name ?? slug
const dirTitle = (slug: string) => directions.value?.find((d) => d.slug === slug)?.title ?? slug

const toCancel = ref<Booking | null>(null)
const confirmOpen = computed({
  get: () => !!toCancel.value,
  set: (v) => {
    if (!v) toCancel.value = null
  },
})
const cancelling = ref(false)
const { show } = useToast()

async function confirmCancel() {
  if (!toCancel.value) return
  cancelling.value = true
  await cancelBooking(toCancel.value.id)
  bookings.value = await getBookings()
  cancelling.value = false
  toCancel.value = null
  show('Запись отменена. Время освободилось для других пациентов.', 'info')
}
</script>

<template>
  <div class="container page">
    <AppBreadcrumbs :items="[{ label: 'Мои записи' }]" />
    <h1 class="page__title">Мои записи</h1>
    <p class="lead page__lead">
      Здесь показаны записи, сделанные на сайте в этом браузере. Они хранятся только на вашем устройстве.
    </p>

    <p v-if="!bookings" class="text-muted">Загружаем записи…</p>

    <template v-else>
      <section aria-labelledby="h-upcoming">
        <h2 id="h-upcoming" class="block-title">Предстоящие</h2>
        <ul v-if="upcoming.length" class="grid grid--3" data-testid="my-upcoming">
          <li v-for="b in upcoming" :key="b.id">
            <article class="visit card" data-testid="my-booking">
              <h3 class="visit__title">{{ dirTitle(b.direction) }}</h3>
              <ul class="visit__list">
                <li><User :size="18" aria-hidden="true" /> {{ docName(b.doctor) }}</li>
                <li><CalendarDays :size="18" aria-hidden="true" /> {{ formatDayShort(b.date).full }}</li>
                <li><Clock :size="18" aria-hidden="true" /> {{ b.time }}</li>
              </ul>
              <p class="text-muted text-small">Запись № {{ b.id }} на имя {{ b.name }}</p>
              <button type="button" class="btn btn--secondary btn--sm" data-testid="cancel-booking" @click="toCancel = b">
                Отменить запись
              </button>
            </article>
          </li>
        </ul>
        <div v-else class="notice empty">
          <p>Предстоящих записей нет.</p>
          <NuxtLink to="/booking" class="btn btn--primary btn--sm">Записаться на приём</NuxtLink>
        </div>
      </section>

      <section v-if="past.length" aria-labelledby="h-past" class="past">
        <h2 id="h-past" class="block-title">Отменённые и прошедшие</h2>
        <ul class="past__list" data-testid="my-past">
          <li v-for="b in past" :key="b.id" class="past__item">
            <span>{{ formatDate(b.date) }}, {{ b.time }} – {{ docName(b.doctor) }} ({{ dirTitle(b.direction) }})</span>
            <span :class="['badge', { 'badge--warning': b.status === 'cancelled' }]">
              {{ b.status === 'cancelled' ? 'Отменена' : 'Прошла' }}
            </span>
          </li>
        </ul>
      </section>
    </template>

    <AppModal v-model="confirmOpen" title="Отменить запись?">
      <div v-if="toCancel" class="stack">
        <p>
          {{ dirTitle(toCancel.direction) }}, {{ docName(toCancel.doctor) }}, {{ formatDayShort(toCancel.date).full }} в
          {{ toCancel.time }}.
        </p>
        <div class="confirm">
          <button type="button" class="btn btn--primary" :disabled="cancelling" data-testid="confirm-cancel" @click="confirmCancel">
            {{ cancelling ? 'Отменяем…' : 'Да, отменить' }}
          </button>
          <button type="button" class="btn btn--secondary" @click="toCancel = null">Нет, оставить</button>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<style lang="scss" scoped>
.block-title {
  margin-bottom: var(--sp-4);
  font-size: var(--fs-lg);
}

.visit {
  display: grid;
  gap: var(--sp-3);
  justify-items: start;
  height: 100%;
  padding: var(--sp-5);

  &__title {
    font-size: var(--fs-md);
  }

  &__list {
    display: grid;
    gap: var(--sp-1);

    li {
      display: flex;
      gap: var(--sp-2);
      align-items: center;
    }

    svg {
      color: var(--c-primary);
    }
  }
}

.empty {
  display: grid;
  gap: var(--sp-3);
  justify-items: start;
  font-size: var(--fs-base);
}

.past {
  margin-top: var(--sp-7);

  &__list {
    display: grid;
    gap: var(--sp-2);
  }

  &__item {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-2);
    align-items: center;
    justify-content: space-between;
    padding: var(--sp-3) var(--sp-4);
    background: var(--c-surface);
    border: 1px solid var(--c-border);
    border-radius: var(--r-md);
  }
}

.confirm {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-3);
}
</style>
