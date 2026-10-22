<script setup lang="ts">
import { Search } from '@lucide/vue'
import { getDirections, getDoctors } from '~/services/api'

usePageSeo({
  title: 'Врачи клиники',
  description: 'Каталог врачей клиники «МедВега»: стаж, категория, рейтинг по отзывам, цена приёма и ближайшая свободная запись.',
})

const [{ data: doctors }, { data: directions }] = await Promise.all([
  useAsyncData('doctors', () => getDoctors()),
  useAsyncData('directions', getDirections),
])
const stats = await useDoctorStats()
const next = useNextDates(() => (doctors.value ?? []).map((d) => d.slug))

/**
 * Состояние фильтра хранится в адресе страницы (?direction=…&q=…&kids=1&sort=…),
 * поэтому отфильтрованным списком можно поделиться ссылкой.
 */
const route = useRoute()
const router = useRouter()
// Статический HTML собран без параметров: query применяется после монтирования, чтобы гидратация совпала с разметкой
const ready = ref(false)
const q = (k: string) => (ready.value && typeof route.query[k] === 'string' ? (route.query[k] as string) : '')
onMounted(() => {
  ready.value = true
  search.value = q('q')
})

function setQuery(patch: Record<string, string | undefined>) {
  router.replace({ query: { ...route.query, ...patch } })
}

const direction = computed({
  get: () => q('direction'),
  set: (v) => setQuery({ direction: v || undefined }),
})
const sort = computed({
  get: () => q('sort') || 'default',
  set: (v) => setQuery({ sort: v === 'default' ? undefined : v }),
})
const kids = computed({
  get: () => q('kids') === '1',
  set: (v) => setQuery({ kids: v ? '1' : undefined }),
})
// поле поиска обновляет адрес без лишней записи в историю на каждый символ
const search = ref('')
watch(search, (v) => {
  if (ready.value && v.trim() !== q('q')) setQuery({ q: v.trim() || undefined })
})
watch(
  () => route.query.q,
  (v) => {
    if ((v ?? '') !== search.value.trim()) search.value = typeof v === 'string' ? v : ''
  },
)

const filtered = computed(() => {
  const term = q('q').toLocaleLowerCase('ru')
  let list = (doctors.value ?? []).filter(
    (d) =>
      (!direction.value || d.direction === direction.value) &&
      (!kids.value || d.children) &&
      (!term || plain(d.name).toLocaleLowerCase('ru').includes(term)),
  )
  if (sort.value === 'exp-desc') list = [...list].sort((a, b) => b.experience - a.experience)
  if (sort.value === 'exp-asc') list = [...list].sort((a, b) => a.experience - b.experience)
  if (sort.value === 'rating') list = [...list].sort((a, b) => (stats.value?.[b.slug]?.rating ?? 0) - (stats.value?.[a.slug]?.rating ?? 0))
  if (sort.value === 'price') list = [...list].sort((a, b) => (stats.value?.[a.slug]?.priceFrom ?? 0) - (stats.value?.[b.slug]?.priceFrom ?? 0))
  return list
})

const dirTitle = (slug: string) => directions.value?.find((d) => d.slug === slug)?.title
const hasFilters = computed(() => !!(q('direction') || q('q') || q('sort') || q('kids')))
const reset = () => {
  search.value = ''
  router.replace({ query: {} })
}
</script>

<template>
  <div class="container page">
    <AppBreadcrumbs :items="[{ label: 'Врачи' }]" />
    <h1 class="page__title">Врачи</h1>
    <p class="lead page__lead">В клинике принимают 16 врачей. Найдите специалиста по фамилии или выберите направление.</p>

    <form class="filters card" role="search" aria-label="Фильтр врачей" @submit.prevent>
      <div class="filters__row">
        <div class="field filters__search">
          <label for="doc-search" class="field__label">Поиск по ФИО</label>
          <div class="filters__input">
            <Search :size="20" aria-hidden="true" class="filters__icon" />
            <input
              id="doc-search"
              v-model="search"
              type="search"
              class="field__control"
              placeholder="Например, Иванова"
              autocomplete="off"
              data-testid="doctor-search"
            />
          </div>
        </div>
        <div class="field filters__sort">
          <label for="doc-sort" class="field__label">Сортировка</label>
          <select id="doc-sort" v-model="sort" class="field__control" data-testid="doctor-sort">
            <option value="default">По умолчанию</option>
            <option value="rating">По рейтингу</option>
            <option value="exp-desc">Сначала с большим стажем</option>
            <option value="exp-asc">Сначала с меньшим стажем</option>
            <option value="price">Сначала дешевле приём</option>
          </select>
        </div>
      </div>

      <fieldset class="filters__dirs">
        <legend class="field__label">Направление</legend>
        <div class="filters__chips" data-testid="doctor-direction">
          <button type="button" class="chip" :aria-pressed="!direction" @click="direction = ''">Все</button>
          <button
            v-for="d in directions"
            :key="d.slug"
            type="button"
            class="chip"
            :aria-pressed="direction === d.slug"
            :data-value="d.slug"
            @click="direction = direction === d.slug ? '' : d.slug"
          >
            {{ d.title }}
          </button>
        </div>
      </fieldset>

      <label class="filters__kids">
        <input v-model="kids" type="checkbox" data-testid="doctor-kids" />
        Только врачи, которые принимают детей
      </label>
    </form>

    <div class="results">
      <h2 class="results__count" aria-live="polite" data-testid="doctor-count">
        Найдено врачей: {{ filtered.length }}
      </h2>
      <button v-if="hasFilters" type="button" class="btn btn--text" @click="reset">Сбросить фильтры</button>
    </div>

    <ul v-if="filtered.length" class="grid grid--3">
      <li v-for="d in filtered" :key="d.slug">
        <DoctorCard :doctor="d" :direction-title="dirTitle(d.direction)" :stats="stats?.[d.slug]" :next="next[d.slug]" />
      </li>
    </ul>
    <div v-else class="notice empty">
      <p>По вашему запросу врачей не найдено. Измените условия поиска или сбросьте фильтры.</p>
      <button type="button" class="btn btn--secondary btn--sm" @click="reset">Сбросить фильтры</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.filters {
  display: grid;
  gap: var(--sp-4);
  padding: var(--sp-4);
  margin-bottom: var(--sp-5);

  @include up(md) {
    padding: var(--sp-5);
  }

  &__row {
    display: grid;
    gap: var(--sp-4);

    @include up(md) {
      grid-template-columns: 2fr 1fr;
    }
  }

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

  &__dirs {
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;

    legend {
      margin-bottom: var(--sp-2);
    }
  }

  // на телефоне чипы прокручиваются горизонтально, на компьютере переносятся
  &__chips {
    display: flex;
    gap: var(--sp-2);
    margin-inline: calc(var(--sp-4) * -1);
    padding-inline: var(--sp-4);
    padding-bottom: var(--sp-1);
    overflow-x: auto;
    scrollbar-width: thin;

    @include up(md) {
      flex-wrap: wrap;
      margin-inline: 0;
      padding-inline: 0;
      overflow: visible;
    }

    .chip {
      flex-shrink: 0;
    }
  }

  &__kids {
    display: flex;
    gap: var(--sp-3);
    align-items: center;
    min-height: var(--tap);
    cursor: pointer;

    input {
      width: 1.25rem;
      height: 1.25rem;
      accent-color: var(--c-primary);
    }
  }
}

.results {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2) var(--sp-4);
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--sp-4);

  &__count {
    font-size: var(--fs-md);
  }
}

.empty {
  display: grid;
  gap: var(--sp-3);
  justify-items: start;
  font-size: var(--fs-base);
}
</style>
