<script setup lang="ts">
usePageSeo({
  title: 'Акции и скидки',
  description: 'Действующие акции клиники «МедВега»: чек-апы, скидки на детский приём и УЗИ. Сроки действия каждой акции.',
})

const { active } = await usePromos()
</script>

<template>
  <div class="container page">
    <AppBreadcrumbs :items="[{ label: 'Акции' }]" />
    <h1 class="page__title">Акции</h1>
    <p class="lead page__lead">Акции действуют в указанные сроки. Скидки по разным акциям не суммируются.</p>
    <h2 class="visually-hidden">Действующие акции</h2>
    <ul v-if="active.length" class="grid grid--3" data-testid="promo-list">
      <li v-for="p in active" :key="p.slug"><PromoCard :promo="p" /></li>
    </ul>
    <p v-else class="notice">Сейчас действующих акций нет. Следите за обновлениями!</p>
  </div>
</template>
