<script setup lang="ts">
import { getDirections, getServices } from '~/services/api'

usePageSeo({
  title: 'Направления и услуги',
  description: 'Направления клиники «МедВега»: терапия, кардиология, неврология, гинекология, урология, ЛОР, офтальмология и УЗИ.',
})

const [{ data: directions }, { data: services }] = await Promise.all([
  useAsyncData('directions', getDirections),
  useAsyncData('services', () => getServices()),
])
const priceFrom = (slug: string) => Math.min(...(services.value ?? []).filter((s) => s.direction === slug).map((s) => s.price))
</script>

<template>
  <div class="container page">
    <AppBreadcrumbs :items="[{ label: 'Направления' }]" />
    <h1 class="page__title">Направления</h1>
    <p class="lead page__lead">
      Выберите направление, чтобы посмотреть перечень услуг с ценами, врачей и ответы на частые вопросы.
    </p>
    <h2 class="visually-hidden">Список направлений</h2>
    <ul class="grid grid--4">
      <li v-for="d in directions" :key="d.slug">
        <DirectionCard :direction="d" :price-from="priceFrom(d.slug)" />
      </li>
    </ul>
  </div>
</template>
