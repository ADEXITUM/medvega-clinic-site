<script setup lang="ts">
import type { Review } from '~/types'
import { getDirections, getDoctors, getReviews } from '~/services/api'

usePageSeo({
  title: 'Отзывы пациентов',
  description: 'Отзывы пациентов о врачах клиники «МедВега». Фильтр по направлению и врачу, форма для нового отзыва.',
})

const [{ data: reviews }, { data: directions }, { data: doctors }] = await Promise.all([
  useAsyncData('reviews', getReviews),
  useAsyncData('directions', getDirections),
  useAsyncData('doctors', () => getDoctors()),
])
const direction = ref('')
const doctor = ref('')
const sort = ref<'new' | 'high' | 'low'>('new')
watch(direction, (v) => {
  if (doctor.value && doctors.value?.find((d) => d.slug === doctor.value)?.direction !== v) doctor.value = ''
  page.value = 1
})
watch([doctor, sort], () => (page.value = 1))

// отзывы, оставленные в этом браузере (на модерации), подгружаются после монтирования;
// фильтр можно передать ссылкой: /reviews?doctor=… (со страницы врача)
const route = useRoute()
onMounted(async () => {
  const doc = typeof route.query.doctor === 'string' ? route.query.doctor : ''
  const found = doctors.value?.find((d) => d.slug === doc)
  if (found) {
    direction.value = found.direction
    await nextTick()
    doctor.value = found.slug
  }
  reviews.value = await getReviews()
})

const doctorOptions = computed(() => (doctors.value ?? []).filter((d) => !direction.value || d.direction === direction.value))
const filtered = computed(() => {
  const list = (reviews.value ?? []).filter(
    (r) => (!direction.value || r.direction === direction.value) && (!doctor.value || r.doctor === doctor.value),
  )
  if (sort.value === 'high') return [...list].sort((a, b) => b.rating - a.rating || b.date.localeCompare(a.date))
  if (sort.value === 'low') return [...list].sort((a, b) => a.rating - b.rating || b.date.localeCompare(a.date))
  return list
})

// распределение оценок: сколько отзывов с 5, 4, 3, 2 и 1 звездой
const distribution = computed(() => {
  const r = (reviews.value ?? []).filter((x) => !x.pending)
  return [5, 4, 3, 2, 1].map((n) => ({ n, count: r.filter((x) => x.rating === n).length, total: r.length }))
})

const PER_PAGE = 6
const page = ref(1)
const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PER_PAGE)))
const visible = computed(() => filtered.value.slice((page.value - 1) * PER_PAGE, page.value * PER_PAGE))
const list = ref<HTMLElement | null>(null)
function changePage(p: number) {
  page.value = p
  list.value?.scrollIntoView({ block: 'start' })
}

const average = computed(() => {
  const r = (reviews.value ?? []).filter((x) => !x.pending)
  return r.length ? (r.reduce((s, x) => s + x.rating, 0) / r.length).toFixed(1).replace('.', ',') : '–'
})

const docName = (slug: string) => doctors.value?.find((d) => d.slug === slug)?.name
const dirTitle = (slug: string) => directions.value?.find((d) => d.slug === slug)?.title

const formOpen = ref(false)
const { show } = useToast()
function onAdded(r: Review) {
  reviews.value = [r, ...(reviews.value ?? [])]
  formOpen.value = false
  direction.value = ''
  show('Спасибо за отзыв! Он появится на сайте после проверки.')
}
</script>

<template>
  <div class="container page">
    <AppBreadcrumbs :items="[{ label: 'Отзывы' }]" />
    <h1 class="page__title">Отзывы пациентов</h1>
    <div class="score card">
      <div class="score__main">
        <p class="score__value">{{ average }}</p>
        <p class="text-muted text-small">средняя оценка по {{ reviews?.filter((r) => !r.pending).length }} отзывам</p>
      </div>
      <ul class="score__bars" aria-label="Распределение оценок">
        <li v-for="d in distribution" :key="d.n" class="score__row">
          <span class="score__label">{{ d.n }}&nbsp;★</span>
          <span class="score__track" aria-hidden="true"><span :style="{ width: `${d.total ? (d.count / d.total) * 100 : 0}%` }" /></span>
          <span class="score__count">{{ d.count }}<span class="visually-hidden"> {{ plural(d.count, ['отзыв', 'отзыва', 'отзывов']) }}</span></span>
        </li>
      </ul>
    </div>

    <div class="toolbar card">
      <div class="field">
        <label for="rv-direction" class="field__label">Направление</label>
        <select id="rv-direction" v-model="direction" class="field__control" data-testid="review-direction">
          <option value="">Все направления</option>
          <option v-for="d in directions" :key="d.slug" :value="d.slug">{{ d.title }}</option>
        </select>
      </div>
      <div class="field">
        <label for="rv-doctor" class="field__label">Врач</label>
        <select id="rv-doctor" v-model="doctor" class="field__control" data-testid="review-doctor">
          <option value="">Все врачи</option>
          <option v-for="d in doctorOptions" :key="d.slug" :value="d.slug">{{ d.name }}</option>
        </select>
      </div>
      <div class="field">
        <label for="rv-sort" class="field__label">Сортировка</label>
        <select id="rv-sort" v-model="sort" class="field__control" data-testid="review-sort">
          <option value="new">Сначала новые</option>
          <option value="high">Сначала положительные</option>
          <option value="low">Сначала критические</option>
        </select>
      </div>
      <button type="button" class="btn btn--primary toolbar__btn" :aria-expanded="formOpen" @click="formOpen = !formOpen">
        Оставить отзыв
      </button>
    </div>

    <section v-if="formOpen" class="card form-card" aria-labelledby="h-form">
      <h2 id="h-form" class="form-card__title">Новый отзыв</h2>
      <ReviewForm v-if="directions && doctors" :directions="directions" :doctors="doctors" @added="onAdded" />
    </section>

    <section ref="list" aria-labelledby="h-list" class="list">
      <h2 id="h-list" class="list__title" aria-live="polite">Найдено отзывов: {{ filtered.length }}</h2>
      <ul v-if="visible.length" class="grid grid--3">
        <li v-for="r in visible" :key="r.id">
          <ReviewCard :review="r" :doctor-name="docName(r.doctor)" :direction-title="dirTitle(r.direction)" />
        </li>
      </ul>
      <p v-else class="notice">Отзывов по выбранным условиям пока нет.</p>
      <AppPagination :page="page" :pages="pages" @change="changePage" />
    </section>
  </div>
</template>

<style lang="scss" scoped>
.toolbar {
  display: grid;
  gap: var(--sp-4);
  align-items: end;
  padding: var(--sp-4);
  margin-bottom: var(--sp-5);

  @include up(md) {
    grid-template-columns: 1fr 1fr;
    padding: var(--sp-5);
  }

  @include up(lg) {
    grid-template-columns: 1fr 1fr 1fr auto;
  }
}

.score {
  display: grid;
  gap: var(--sp-4);
  align-items: center;
  max-width: 40rem;
  padding: var(--sp-4) var(--sp-5);
  margin-bottom: var(--sp-5);

  @include up(sm) {
    grid-template-columns: auto 1fr;
    gap: var(--sp-6);
  }

  &__value {
    font-weight: 700;
    font-size: 3rem;
    line-height: 1;
    color: var(--c-primary);
  }

  &__bars {
    display: grid;
    gap: var(--sp-1);
    padding: 0;
    list-style: none;
  }

  &__row {
    display: grid;
    grid-template-columns: 2.5rem 1fr 2rem;
    gap: var(--sp-2);
    align-items: center;
    font-size: var(--fs-sm);
  }

  &__track {
    height: 8px;
    overflow: hidden;
    background: var(--c-bg);
    border-radius: var(--r-full);

    span {
      display: block;
      height: 100%;
      background: #f59e0b;
    }
  }

  &__count {
    text-align: right;
    color: var(--c-muted);
  }
}

html[data-scheme]:not([data-scheme='default']) .score__track span {
  background: var(--c-text);
}

.form-card {
  max-width: 48rem;
  padding: var(--sp-5);
  margin-bottom: var(--sp-6);

  &__title {
    margin-bottom: var(--sp-4);
    font-size: var(--fs-lg);
  }
}

.list {
  scroll-margin-top: calc(var(--header-h) + var(--sp-4));

  &__title {
    margin-bottom: var(--sp-4);
    font-size: var(--fs-md);
  }
}
</style>
