<script setup lang="ts">
import { Search } from '@lucide/vue'
import { getDirections, getDoctors } from '~/services/api'

usePageSeo({
  title: 'Врачи клиники',
  description: 'Каталог врачей клиники «МедВега»: стаж, категория, направление. Поиск по фамилии и онлайн-запись.',
})

const [{ data: doctors }, { data: directions }] = await Promise.all([
  useAsyncData('doctors', () => getDoctors()),
  useAsyncData('directions', getDirections),
])

/**
 * Состояние фильтра хранится в адресе страницы (?direction=…&q=…&sort=…),
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

const direction = computed({
  get: () => q('direction'),
  set: (v) => setQuery({ direction: v || undefined }),
})
const sort = computed({
  get: () => q('sort') || 'default',
  set: (v) => setQuery({ sort: v === 'default' ? undefined : v }),
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

function setQuery(patch: Record<string, string | undefined>) {
  router.replace({ query: { ...route.query, ...patch } })
}

const filtered = computed(() => {
  const term = q('q').toLocaleLowerCase('ru')
  let list = (doctors.value ?? []).filter(
    (d) => (!direction.value || d.direction === direction.value) && (!term || d.name.toLocaleLowerCase('ru').includes(term)),
  )
  if (sort.value === 'exp-desc') list = [...list].sort((a, b) => b.experience - a.experience)
  if (sort.value === 'exp-asc') list = [...list].sort((a, b) => a.experience - b.experience)
  return list
})

const dirTitle = (slug: string) => directions.value?.find((d) => d.slug === slug)?.title
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
      <div class="field">
        <label for="doc-direction" class="field__label">Направление</label>
        <select id="doc-direction" v-model="direction" class="field__control" data-testid="doctor-direction">
          <option value="">Все направления</option>
          <option v-for="d in directions" :key="d.slug" :value="d.slug">{{ d.title }}</option>
        </select>
      </div>
      <div class="field">
        <label for="doc-sort" class="field__label">Сортировка</label>
        <select id="doc-sort" v-model="sort" class="field__control" data-testid="doctor-sort">
          <option value="default">По умолчанию</option>
          <option value="exp-desc">Сначала с большим стажем</option>
          <option value="exp-asc">Сначала с меньшим стажем</option>
        </select>
      </div>
    </form>

    <div class="results">
      <h2 class="results__count" aria-live="polite" data-testid="doctor-count">
        Найдено врачей: {{ filtered.length }}
      </h2>
      <button v-if="q('direction') || q('q') || q('sort')" type="button" class="btn btn--text" @click="reset">
        Сбросить фильтры
      </button>
    </div>

    <ul v-if="filtered.length" class="grid grid--3">
      <li v-for="d in filtered" :key="d.slug"><DoctorCard :doctor="d" :direction-title="dirTitle(d.direction)" /></li>
    </ul>
    <p v-else class="notice">По вашему запросу врачей не найдено. Измените условия поиска или сбросьте фильтры.</p>
  </div>
</template>

<style lang="scss" scoped>
.filters {
  display: grid;
  gap: var(--sp-4);
  padding: var(--sp-4);
  margin-bottom: var(--sp-5);

  @include up(md) {
    grid-template-columns: 1fr 1fr;
    padding: var(--sp-5);
  }

  @include up(lg) {
    grid-template-columns: 2fr 1.2fr 1.2fr;
  }

  &__search {
    @include up(md) {
      grid-column: 1 / -1;
    }

    @include up(lg) {
      grid-column: auto;
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
</style>
