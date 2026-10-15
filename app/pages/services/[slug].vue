<script setup lang="ts">
import { getDirection, getDoctors, getFaq, getServices } from '~/services/api'

const route = useRoute()
const slug = String(route.params.slug)

const { data: direction } = await useAsyncData(`direction-${slug}`, () => getDirection(slug))
if (!direction.value) throw createError({ statusCode: 404, statusMessage: 'Направление не найдено', fatal: true })

const [{ data: services }, { data: doctors }, { data: faq }] = await Promise.all([
  useAsyncData(`services-${slug}`, () => getServices(slug)),
  useAsyncData(`doctors-${slug}`, () => getDoctors(slug)),
  useAsyncData(`faq-${slug}`, () => getFaq(slug)),
])

usePageSeo({
  title: `${direction.value.title} – услуги и цены`,
  description: `${direction.value.title} в клинике «МедВега»: ${direction.value.short} Цены, врачи и онлайн-запись.`,
})
</script>

<template>
  <div v-if="direction" class="container page">
    <AppBreadcrumbs :items="[{ label: 'Направления', to: '/services' }, { label: direction.title }]" />

    <div class="dir-head">
      <div class="dir-head__icon"><DirectionIcon :name="direction.icon" :size="40" /></div>
      <div>
        <h1 class="page__title">{{ direction.title }}</h1>
        <p class="lead">{{ direction.description }}</p>
      </div>
    </div>
    <NuxtLink :to="{ path: '/booking', query: { direction: direction.slug } }" class="btn btn--primary">
      Записаться на приём
    </NuxtLink>

    <section class="block" aria-labelledby="h-services">
      <h2 id="h-services" class="block__title">Услуги и цены</h2>
      <div class="table-wrap">
        <table class="data-table">
          <caption class="visually-hidden">
            Услуги направления «{{ direction.title }}»
          </caption>
          <thead>
            <tr>
              <th scope="col">Код</th>
              <th scope="col">Услуга</th>
              <th scope="col" class="num">Цена</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in services" :key="s.code">
              <td>{{ s.code }}</td>
              <td>{{ s.title }}</td>
              <td class="num">{{ formatPrice(s.price) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="text-muted text-small">Полный прайс-лист – на странице <NuxtLink to="/prices">«Цены»</NuxtLink>.</p>
    </section>

    <section class="block" aria-labelledby="h-doctors">
      <h2 id="h-doctors" class="block__title">Врачи направления</h2>
      <ul class="grid grid--3">
        <li v-for="d in doctors" :key="d.slug"><DoctorCard :doctor="d" /></li>
      </ul>
    </section>

    <section v-if="faq?.length" class="block" aria-labelledby="h-faq">
      <h2 id="h-faq" class="block__title">Частые вопросы</h2>
      <AppAccordion v-for="f in faq" :key="f.q" :title="f.q">
        <p>{{ f.a }}</p>
      </AppAccordion>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.dir-head {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  margin-bottom: var(--sp-5);

  @include up(md) {
    flex-direction: row;
    align-items: flex-start;
  }

  &__icon {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: 4.5rem;
    height: 4.5rem;
    color: var(--c-primary);
    background: var(--c-primary-soft);
    border-radius: var(--r-lg);
  }

  .lead {
    max-width: 65ch;
  }
}

.block {
  margin-top: var(--sp-7);

  &__title {
    margin-bottom: var(--sp-4);
  }
}

.num {
  text-align: right !important;
  white-space: nowrap;
}

.data-table {
  background: var(--c-surface);
  border-radius: var(--r-md);
}
</style>
