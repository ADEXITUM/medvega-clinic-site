<script setup lang="ts">
import { getDirections, getDoctors } from '~/services/api'

usePageSeo({ title: 'Карта сайта', description: 'Карта сайта клиники «МедВега»: все разделы, направления и страницы врачей.' })

const [{ data: directions }, { data: doctors }] = await Promise.all([
  useAsyncData('directions', getDirections),
  useAsyncData('doctors', () => getDoctors()),
])
</script>

<template>
  <div class="container page">
    <AppBreadcrumbs :items="[{ label: 'Карта сайта' }]" />
    <h1 class="page__title">Карта сайта</h1>
    <div class="map-grid">
      <section aria-labelledby="h-main">
        <h2 id="h-main" class="map-grid__title">Разделы</h2>
        <ul class="map-grid__list">
          <li><NuxtLink to="/">Главная</NuxtLink></li>
          <li v-for="item in MAIN_NAV" :key="item.to">
            <NuxtLink :to="item.to">{{ item.label }}</NuxtLink>
          </li>
          <li><NuxtLink to="/booking">Онлайн-запись</NuxtLink></li>
          <li><NuxtLink to="/my">Мои записи</NuxtLink></li>
          <li><NuxtLink to="/documents">Документы</NuxtLink></li>
          <li><NuxtLink to="/privacy">Политика обработки персональных данных</NuxtLink></li>
          <li><NuxtLink to="/search">Поиск по сайту</NuxtLink></li>
        </ul>
      </section>
      <section aria-labelledby="h-dirs">
        <h2 id="h-dirs" class="map-grid__title">Направления</h2>
        <ul class="map-grid__list">
          <li v-for="d in directions" :key="d.slug">
            <NuxtLink :to="`/services/${d.slug}`">{{ d.title }}</NuxtLink>
          </li>
        </ul>
      </section>
      <section aria-labelledby="h-docs">
        <h2 id="h-docs" class="map-grid__title">Врачи</h2>
        <ul class="map-grid__list">
          <li v-for="d in doctors" :key="d.slug">
            <NuxtLink :to="`/doctors/${d.slug}`">{{ d.name }}</NuxtLink>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.map-grid {
  display: grid;
  gap: var(--sp-6);

  @include up(md) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  &__title {
    margin-bottom: var(--sp-3);
    font-size: var(--fs-lg);
  }

  &__list {
    display: grid;
    padding: 0;
    list-style: none;

    a {
      display: inline-flex;
      align-items: center;
      min-height: var(--tap);
    }
  }
}
</style>
