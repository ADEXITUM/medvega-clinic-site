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
// отзывы, оставленные в этом браузере (на модерации), подгружаются после монтирования
onMounted(async () => {
  reviews.value = await getReviews()
})

const direction = ref('')
const doctor = ref('')
watch(direction, () => {
  doctor.value = ''
  page.value = 1
})
watch(doctor, () => (page.value = 1))

const doctorOptions = computed(() => (doctors.value ?? []).filter((d) => !direction.value || d.direction === direction.value))
const filtered = computed(() =>
  (reviews.value ?? []).filter((r) => (!direction.value || r.direction === direction.value) && (!doctor.value || r.doctor === doctor.value)),
)

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
    <p class="lead page__lead">
      Средняя оценка клиники – <strong>{{ average }}</strong> из 5 по {{ reviews?.filter((r) => !r.pending).length }} отзывам.
    </p>

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
    grid-template-columns: 1fr 1fr auto;
  }
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
