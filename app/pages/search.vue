<script setup lang="ts">
import { Search } from '@lucide/vue'
import { getDirections, getDoctors, getServices } from '~/services/api'

usePageSeo({ title: 'Поиск по сайту', description: 'Поиск по направлениям, услугам и врачам клиники «МедВега».' })
useSeoMeta({ robots: 'noindex, follow' })

const [{ data: directions }, { data: doctors }, { data: services }] = await Promise.all([
  useAsyncData('directions', getDirections),
  useAsyncData('doctors', () => getDoctors()),
  useAsyncData('services', () => getServices()),
])

const POPULAR = ['УЗИ', 'Кардиолог', 'ЭКГ', 'Детский', 'Справка', 'Зрение']

// Запрос хранится в адресе (?q=…); применяется после монтирования, чтобы гидратация совпала со статическим HTML
const route = useRoute()
const router = useRouter()
const query = ref('')
const input = ref<HTMLInputElement | null>(null)
onMounted(() => {
  query.value = typeof route.query.q === 'string' ? route.query.q : ''
  if (!query.value) input.value?.focus()
})
watch(query, (v) => router.replace({ query: v.trim() ? { q: v.trim() } : {} }))

const term = computed(() => query.value.trim().toLocaleLowerCase('ru'))
const has = (s: string) => plain(s).toLocaleLowerCase('ru').includes(term.value)

const found = computed(() => {
  if (term.value.length < 2) return null
  return {
    directions: (directions.value ?? []).filter((d) => has(d.title) || has(d.short)),
    doctors: (doctors.value ?? []).filter((d) => has(d.name) || has(d.position)),
    services: (services.value ?? []).filter((s) => has(s.title) || has(s.code)),
  }
})
const total = computed(() => (found.value ? found.value.directions.length + found.value.doctors.length + found.value.services.length : 0))
const dirTitle = (slug: string) => directions.value?.find((d) => d.slug === slug)?.title
</script>

<template>
  <div class="container page">
    <AppBreadcrumbs :items="[{ label: 'Поиск по сайту' }]" />
    <h1 class="page__title">Поиск по сайту</h1>

    <form class="search card" role="search" @submit.prevent>
      <label for="site-search" class="field__label">Что вы ищете?</label>
      <div class="search__input">
        <Search :size="20" aria-hidden="true" class="search__icon" />
        <input
          id="site-search"
          ref="input"
          v-model="query"
          type="search"
          class="field__control"
          placeholder="Врач, услуга или направление"
          autocomplete="off"
          data-testid="site-search"
        />
      </div>
      <p class="field__hint" aria-live="polite">
        {{ found ? `Найдено: ${total}` : 'Введите не меньше двух букв' }}
      </p>
      <div class="search__popular">
        <span class="text-muted text-small">Часто ищут:</span>
        <button v-for="p in POPULAR" :key="p" type="button" class="chip" @click="query = p">{{ p }}</button>
      </div>
    </form>

    <template v-if="found">
      <section v-if="found.directions.length" class="res" aria-labelledby="h-r-dir">
        <h2 id="h-r-dir" class="res__title">Направления</h2>
        <ul class="res__list">
          <li v-for="d in found.directions" :key="d.slug">
            <NuxtLink :to="`/services/${d.slug}`"><HighlightText :text="d.title" :term="term" /></NuxtLink>
            <span class="text-muted text-small"> – <HighlightText :text="d.short" :term="term" /></span>
          </li>
        </ul>
      </section>
      <section v-if="found.doctors.length" class="res" aria-labelledby="h-r-doc">
        <h2 id="h-r-doc" class="res__title">Врачи</h2>
        <ul class="res__list">
          <li v-for="d in found.doctors" :key="d.slug">
            <NuxtLink :to="`/doctors/${d.slug}`"><HighlightText :text="d.name" :term="term" /></NuxtLink>
            <span class="text-muted text-small"> – <HighlightText :text="d.position" :term="term" /></span>
          </li>
        </ul>
      </section>
      <section v-if="found.services.length" class="res" aria-labelledby="h-r-srv">
        <h2 id="h-r-srv" class="res__title">Услуги</h2>
        <ul class="res__list">
          <li v-for="s in found.services" :key="s.code">
            <NuxtLink :to="`/services/${s.direction}`"><HighlightText :text="s.title" :term="term" /></NuxtLink>
            <span class="text-muted text-small"> – {{ dirTitle(s.direction) }}, {{ formatPrice(s.price) }}</span>
          </li>
        </ul>
      </section>
      <p v-if="!total" class="notice">Ничего не найдено. Попробуйте изменить запрос или посмотрите <NuxtLink to="/sitemap">карту сайта</NuxtLink>.</p>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.search {
  display: grid;
  gap: var(--sp-2);
  max-width: 48rem;
  padding: var(--sp-5);
  margin-bottom: var(--sp-6);

  &__input {
    position: relative;

    .field__control {
      padding-left: 2.75rem;
    }
  }

  &__icon {
    position: absolute;
    top: 50%;
    left: 0.875rem;
    color: var(--c-muted);
    transform: translateY(-50%);
  }

  &__popular {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-2);
    align-items: center;
  }
}

.res {
  margin-bottom: var(--sp-6);

  &__title {
    margin-bottom: var(--sp-3);
    font-size: var(--fs-lg);
  }

  &__list {
    display: grid;
    gap: var(--sp-2);
    padding: 0;
    list-style: none;

    a {
      font-weight: 700;
    }
  }
}
</style>
