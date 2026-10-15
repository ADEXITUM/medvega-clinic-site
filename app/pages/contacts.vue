<script setup lang="ts">
import { Bus, Clock, Mail, MapPin, Phone } from '@lucide/vue'
import { getClinic } from '~/services/api'

usePageSeo({
  title: 'Контакты и схема проезда',
  description: 'Адрес клиники «МедВега» в Благовещенске, телефон, режим работы, карта и схема проезда.',
})

const { data: clinic } = await useAsyncData('clinic', getClinic)
const abs = useAbsoluteUrl()
useJsonLd('clinic', () => (clinic.value ? clinicJsonLd(clinic.value, abs) : null))
const callback = useState('callback-open', () => false)
</script>

<template>
  <div v-if="clinic" class="container page">
    <AppBreadcrumbs :items="[{ label: 'Контакты' }]" />
    <h1 class="page__title">Контакты</h1>

    <div class="contacts">
      <div class="contacts__info card">
        <ul class="contacts__list">
          <li>
            <MapPin :size="24" aria-hidden="true" />
            <div>
              <h2 class="contacts__label">Адрес</h2>
              <p>{{ clinic.address.full }}</p>
            </div>
          </li>
          <li>
            <Phone :size="24" aria-hidden="true" />
            <div>
              <h2 class="contacts__label">Телефон</h2>
              <p><a :href="`tel:${clinic.phoneHref}`">{{ clinic.phone }}</a></p>
            </div>
          </li>
          <li>
            <Mail :size="24" aria-hidden="true" />
            <div>
              <h2 class="contacts__label">Электронная почта</h2>
              <p><a :href="`mailto:${clinic.email}`">{{ clinic.email }}</a></p>
            </div>
          </li>
          <li>
            <Clock :size="24" aria-hidden="true" />
            <div>
              <h2 class="contacts__label">Режим работы</h2>
              <p v-for="h in clinic.hours" :key="h.days">{{ h.days }}: {{ h.time }}</p>
            </div>
          </li>
          <li>
            <Bus :size="24" aria-hidden="true" />
            <div>
              <h2 class="contacts__label">Как добраться</h2>
              <p>{{ clinic.directions }}</p>
            </div>
          </li>
        </ul>
        <div class="contacts__actions">
          <NuxtLink to="/booking" class="btn btn--primary">Записаться онлайн</NuxtLink>
          <button type="button" class="btn btn--secondary" data-testid="callback-open" @click="callback = true">
            Заказать обратный звонок
          </button>
        </div>
      </div>

      <section class="contacts__map" aria-labelledby="h-map">
        <h2 id="h-map" class="contacts__map-title">Карта и схема проезда</h2>
        <OsmMap :lat="clinic.geo.lat" :lon="clinic.geo.lon" :label="`${clinic.name}, ${clinic.address.street}`" />
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.contacts {
  display: grid;
  gap: var(--sp-5);

  @include up(lg) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr);
    align-items: start;
  }

  &__info {
    padding: var(--sp-5);
  }

  &__list {
    display: grid;
    gap: var(--sp-4);

    li {
      display: flex;
      gap: var(--sp-3);
      align-items: flex-start;
    }

    svg {
      flex-shrink: 0;
      color: var(--c-primary);
    }
  }

  &__label {
    font-size: var(--fs-sm);
    color: var(--c-muted);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-3);
    margin-top: var(--sp-5);
  }

  &__map-title {
    margin-bottom: var(--sp-3);
    font-size: var(--fs-lg);
  }
}
</style>
