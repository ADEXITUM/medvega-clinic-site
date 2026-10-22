<script setup lang="ts">
import { Award, Baby, CalendarClock, GraduationCap, Star } from '@lucide/vue'
import { getDirection, getDoctor, getNearestSlots, getReviews, getServices } from '~/services/api'

const route = useRoute()
const slug = String(route.params.slug)

const { data: doctor } = await useAsyncData(`doctor-${slug}`, () => getDoctor(slug))
if (!doctor.value) throw createError({ statusCode: 404, statusMessage: 'Врач не найден', fatal: true })

const [{ data: direction }, { data: allServices }] = await Promise.all([
  useAsyncData(`direction-${doctor.value.direction}`, () => getDirection(doctor.value!.direction)),
  useAsyncData(`services-${doctor.value.direction}`, () => getServices(doctor.value!.direction)),
])
const services = computed(() => (allServices.value ?? []).filter((s) => doctor.value!.services.includes(s.code)))

// отзывы о враче и его рейтинг
const { data: allReviews } = await useAsyncData('reviews', getReviews)
const reviews = computed(() => (allReviews.value ?? []).filter((r) => r.doctor === slug && !r.pending))
const rating = computed(() =>
  reviews.value.length ? reviews.value.reduce((s, r) => s + r.rating, 0) / reviews.value.length : null,
)
const bookingLink = (extra: Record<string, string> = {}) => ({
  path: '/booking',
  query: { direction: doctor.value!.direction, doctor: slug, ...extra },
})

// Свободные окна зависят от текущей даты, поэтому считаются в браузере
const slots = ref<{ date: string; time: string }[] | null>(null)
onMounted(async () => {
  slots.value = await getNearestSlots(slug, 6)
})

usePageSeo({
  title: `${doctor.value.name} – ${doctor.value.position.toLowerCase()}`,
  description: `${doctor.value.name}, ${doctor.value.position.toLowerCase()}, стаж ${experienceText(doctor.value.experience)}. ${doctor.value.about}`,
})

const abs = useAbsoluteUrl()
useJsonLd('physician', () => ({
  '@context': 'https://schema.org',
  '@type': 'Physician',
  name: doctor.value!.name,
  description: doctor.value!.about,
  url: abs(`/doctors/${slug}`),
  medicalSpecialty: direction.value?.title,
  hasCredential: doctor.value!.category,
  worksFor: { '@type': 'MedicalClinic', name: 'МедВега', url: abs('/') },
}))
</script>

<template>
  <div v-if="doctor" class="container page">
    <AppBreadcrumbs :items="[{ label: 'Врачи', to: '/doctors' }, { label: doctor.name }]" />

    <div class="doc">
      <div class="doc__aside card">
        <DoctorAvatar :name="doctor.name" :direction="doctor.direction" size="lg" />
        <NuxtLink
          :to="{ path: '/booking', query: { direction: doctor.direction, doctor: doctor.slug } }"
          class="btn btn--primary btn--block"
          data-testid="doctor-book"
        >
          Записаться
        </NuxtLink>
        <p v-if="rating" class="doc__rating">
          <Star :size="18" aria-hidden="true" class="doc__star" />
          <strong>{{ formatRating(rating) }}</strong>&nbsp;из 5
          <a href="#h-reviews">{{ reviews.length }} {{ plural(reviews.length, ['отзыв', 'отзыва', 'отзывов']) }}</a>
        </p>
      </div>

      <div class="doc__main">
        <h1 class="page__title">{{ doctor.name }}</h1>
        <p class="lead">{{ doctor.position }}</p>
        <ul class="doc__facts">
          <li><Award :size="20" aria-hidden="true" /> Стаж {{ experienceText(doctor.experience) }}</li>
          <li><GraduationCap :size="20" aria-hidden="true" /> {{ doctor.category }}</li>
          <li v-if="doctor.children"><Baby :size="20" aria-hidden="true" /> Принимает детей</li>
          <li v-if="direction">
            Направление: <NuxtLink :to="`/services/${direction.slug}`">{{ direction.title }}</NuxtLink>
          </li>
        </ul>
        <p>{{ doctor.about }}</p>

        <section class="block" aria-labelledby="h-slots">
          <h2 id="h-slots" class="block__title"><CalendarClock :size="24" aria-hidden="true" /> Ближайшие свободные окна</h2>
          <SkeletonBlock v-if="!slots" :chips="6" />
          <ul v-else-if="slots.length" class="slots" data-testid="nearest-slots">
            <li v-for="s in slots" :key="s.date + s.time">
              <NuxtLink
                :to="{ path: '/booking', query: { direction: doctor.direction, doctor: doctor.slug, date: s.date, time: s.time } }"
                class="chip"
              >
                {{ formatDayShort(s.date).weekday }}, {{ formatDate(s.date, false) }}, {{ s.time }}
              </NuxtLink>
            </li>
          </ul>
          <p v-else class="notice">В ближайшие две недели свободных окон нет. Позвоните в регистратуру.</p>
        </section>

        <section class="block" aria-labelledby="h-edu">
          <h2 id="h-edu" class="block__title">Образование</h2>
          <ul class="doc__edu">
            <li v-for="e in doctor.education" :key="e">{{ e }}</li>
          </ul>
        </section>

        <section class="block" aria-labelledby="h-srv">
          <h2 id="h-srv" class="block__title">Услуги и цены</h2>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th scope="col">Услуга</th>
                  <th scope="col" class="num">Цена</th>
                  <th scope="col"><span class="visually-hidden">Запись</span></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in services" :key="s.code">
                  <td>{{ s.title }}</td>
                  <td class="num">{{ formatPrice(s.price) }}</td>
                  <td class="num">
                    <NuxtLink :to="bookingLink()" class="btn btn--text btn--sm">
                      Записаться<span class="visually-hidden">: {{ s.title }}</span>
                    </NuxtLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section v-if="reviews.length" class="block" aria-labelledby="h-reviews">
          <h2 id="h-reviews" class="block__title">Отзывы пациентов</h2>
          <ul class="doc__reviews">
            <li v-for="r in reviews" :key="r.id">
              <ReviewCard :review="r" />
            </li>
          </ul>
          <NuxtLink :to="{ path: '/reviews', query: { doctor: slug } }" class="btn btn--text">Все отзывы и форма нового отзыва</NuxtLink>
        </section>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.doc {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--sp-5);

  @include up(md) {
    grid-template-columns: 16rem minmax(0, 1fr);
    align-items: start;
  }

  @include up(lg) {
    gap: var(--sp-7);
  }

  &__aside {
    display: grid;
    gap: var(--sp-4);
    justify-items: center;
    padding: var(--sp-5);

    @include up(md) {
      position: sticky;
      top: calc(var(--header-h) + var(--sp-4));
    }
  }

  &__facts {
    display: grid;
    gap: var(--sp-2);
    margin-block: var(--sp-4);

    li {
      display: flex;
      gap: var(--sp-2);
      align-items: center;
    }

    svg {
      flex-shrink: 0;
      color: var(--c-primary);
    }
  }

  &__rating {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-1);
    align-items: center;
    justify-content: center;
    font-size: var(--fs-sm);
  }

  &__star {
    color: #b45309;
    fill: #f59e0b;
  }

  &__reviews {
    display: grid;
    gap: var(--sp-3);
    margin-bottom: var(--sp-3);

    @include up(lg) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  &__edu {
    padding-left: var(--sp-5);
    list-style: disc;

    li + li {
      margin-top: var(--sp-1);
    }
  }
}

.block {
  margin-top: var(--sp-6);

  &__title {
    display: flex;
    gap: var(--sp-2);
    align-items: center;
    margin-bottom: var(--sp-3);
    font-size: var(--fs-lg);

    svg {
      color: var(--c-primary);
    }
  }
}

.slots {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
}

.num {
  text-align: right !important;
  white-space: nowrap;
}

.data-table {
  background: var(--c-surface);
}
</style>
