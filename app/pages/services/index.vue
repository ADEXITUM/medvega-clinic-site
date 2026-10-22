<script setup lang="ts">
import { getDirections } from '~/services/api'

usePageSeo({
  title: 'Направления и услуги',
  description: 'Направления клиники «МедВега»: терапия, кардиология, неврология, гинекология, урология, ЛОР, офтальмология и УЗИ.',
})

const { data: directions } = await useAsyncData('directions', getDirections)
</script>

<template>
  <div class="container page">
    <AppBreadcrumbs :items="[{ label: 'Направления' }]" />
    <h1 class="page__title">Направления</h1>
    <p class="lead page__lead">
      Выберите направление, чтобы посмотреть перечень услуг с ценами, врачей и ответы на частые вопросы.
    </p>
    <h2 class="visually-hidden">Список направлений</h2>
    <ul class="grid grid--dirs">
      <li v-for="d in directions" :key="d.slug"><DirectionCard :direction="d" /></li>
    </ul>
  </div>
</template>
