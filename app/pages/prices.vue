<script setup lang="ts">
import { Search } from '@lucide/vue'
import { getDirections, getServices } from '~/services/api'

usePageSeo({
  title: 'Цены на услуги',
  description: 'Прайс-лист клиники «МедВега»: стоимость приёма врачей, УЗИ, ЭКГ и процедур. Быстрый поиск по названию и коду услуги.',
})

const [{ data: directions }, { data: services }] = await Promise.all([
  useAsyncData('directions', getDirections),
  useAsyncData('services', () => getServices()),
])

const search = ref('')
const opened = ref<Record<string, boolean>>({})
const term = computed(() => search.value.trim().toLocaleLowerCase('ru'))

// Мгновенный поиск по названию и коду услуги
const groups = computed(() =>
  (directions.value ?? [])
    .map((d) => ({
      ...d,
      items: (services.value ?? []).filter(
        (s) =>
          s.direction === d.slug &&
          (!term.value || s.title.toLocaleLowerCase('ru').includes(term.value) || s.code.toLowerCase().includes(term.value)),
      ),
    }))
    .filter((g) => g.items.length),
)
const total = computed(() => groups.value.reduce((n, g) => n + g.items.length, 0))

// при поиске найденные группы раскрываются автоматически
const isOpen = (slug: string) => !!term.value || !!opened.value[slug]
const setOpen = (slug: string, v: boolean) => (opened.value = { ...opened.value, [slug]: v })
const servicesWord = (n: number) => plural(n, ['услуга', 'услуги', 'услуг'])
</script>

<template>
  <div class="container page">
    <AppBreadcrumbs :items="[{ label: 'Цены' }]" />
    <h1 class="page__title">Цены</h1>
    <p class="lead page__lead">
      Цены указаны в рублях и действуют с 1 сентября 2026 года. Перечень услуг и цены утверждены приказом главного врача.
    </p>

    <div class="price-search card" role="search">
      <label for="price-search" class="field__label">Поиск по названию или коду услуги</label>
      <div class="price-search__input">
        <Search :size="20" aria-hidden="true" class="price-search__icon" />
        <input
          id="price-search"
          v-model="search"
          type="search"
          class="field__control"
          placeholder="Например, УЗИ или KAR-03"
          autocomplete="off"
          data-testid="price-search"
        />
      </div>
      <p class="field__hint" aria-live="polite" data-testid="price-count">Найдено: {{ total }} {{ servicesWord(total) }}</p>
    </div>

    <div v-if="groups.length" class="price-groups">
      <AppAccordion
        v-for="g in groups"
        :key="g.slug"
        :title="g.title"
        :meta="`${g.items.length} ${servicesWord(g.items.length)}`"
        level="h2"
        :open="isOpen(g.slug)"
        @update:open="setOpen(g.slug, $event)"
      >
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th scope="col">Код</th>
                <th scope="col">Услуга</th>
                <th scope="col" class="num">Цена</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in g.items" :key="s.code" data-testid="price-row">
                <td class="code">{{ s.code }}</td>
                <td>{{ s.title }}</td>
                <td class="num">{{ formatPrice(s.price) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <NuxtLink :to="{ path: '/booking', query: { direction: g.slug } }" class="btn btn--secondary btn--sm">
          Записаться<span class="visually-hidden"> – {{ g.title }}</span>
        </NuxtLink>
      </AppAccordion>
    </div>
    <p v-else class="notice">Услуги не найдены. Попробуйте другое название или позвоните нам – подскажем.</p>

    <p class="text-muted text-small disclaimer">
      Информация о ценах не является публичной офертой. Точную стоимость лечения определяет врач после осмотра. Платные медицинские
      услуги оказываются на основании договора в соответствии с Правилами, утверждёнными постановлением Правительства РФ от
      30.05.2026 № 659.
    </p>
  </div>
</template>

<style lang="scss" scoped>
.price-search {
  display: grid;
  gap: var(--sp-2);
  padding: var(--sp-4);
  margin-bottom: var(--sp-5);

  @include up(md) {
    padding: var(--sp-5);
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

.data-table {
  margin-bottom: var(--sp-3);
}

.num {
  text-align: right !important;
  white-space: nowrap;
}

.code {
  white-space: nowrap;
  color: var(--c-muted);
}

.disclaimer {
  max-width: 75ch;
  margin-top: var(--sp-6);
}
</style>
