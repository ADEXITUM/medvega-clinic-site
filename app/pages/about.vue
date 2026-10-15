<script setup lang="ts">
import { BadgeCheck, Building2, ShieldCheck } from '@lucide/vue'
import { getClinic } from '~/services/api'

usePageSeo({
  title: 'О клинике',
  description: 'История клиники «МедВега», оборудование, лицензия и реквизиты. Многопрофильная частная клиника в Благовещенске.',
})

const { data: clinic } = await useAsyncData('clinic', getClinic)

const rooms = [
  { title: 'Зона ресепшен', hue: 188 },
  { title: 'Кабинет УЗИ-диагностики', hue: 210 },
  { title: 'Процедурный кабинет', hue: 150 },
  { title: 'Детская зона ожидания', hue: 30 },
]
</script>

<template>
  <div v-if="clinic" class="container page">
    <AppBreadcrumbs :items="[{ label: 'О клинике' }]" />
    <h1 class="page__title">О клинике</h1>
    <p class="lead page__lead">
      «МедВега» – многопрофильная частная клиника в Благовещенске. Мы помогаем взрослым и детям по восьми направлениям, проводим
      ультразвуковую и функциональную диагностику.
    </p>
    <p class="notice note">{{ clinic.note }}</p>

    <section class="block" aria-labelledby="h-history">
      <h2 id="h-history" class="block__title">История</h2>
      <ol class="timeline">
        <li v-for="h in clinic.history" :key="h.year" class="timeline__item">
          <span class="timeline__year">{{ h.year }}</span>
          <p>{{ h.text }}</p>
        </li>
      </ol>
    </section>

    <section class="block" aria-labelledby="h-equip">
      <h2 id="h-equip" class="block__title">Оборудование</h2>
      <ul class="equip">
        <li v-for="e in clinic.equipment" :key="e"><BadgeCheck :size="20" aria-hidden="true" /> {{ e }}</li>
      </ul>
    </section>

    <section class="block" aria-labelledby="h-photo">
      <h2 id="h-photo" class="block__title">Фотографии клиники</h2>
      <p class="text-muted text-small photo-note">
        Вместо фотографий использованы иллюстрации (учебный проект), источники изображений перечислены в docs/images.md.
      </p>
      <ul class="grid grid--4">
        <li v-for="r in rooms" :key="r.title">
          <figure class="photo">
            <svg class="illustration photo__img" viewBox="0 0 320 200" role="img" :aria-label="`Иллюстрация: ${r.title}`">
              <rect width="320" height="200" rx="16" :fill="`hsl(${r.hue} 55% 92%)`" />
              <rect x="20" y="120" width="280" height="60" rx="10" :fill="`hsl(${r.hue} 45% 80%)`" />
              <rect x="40" y="40" width="90" height="70" rx="10" fill="#fff" />
              <rect x="150" y="40" width="130" height="70" rx="10" fill="#fff" />
              <circle cx="85" cy="75" r="18" :fill="`hsl(${r.hue} 50% 70%)`" />
              <rect x="170" y="60" width="90" height="10" rx="5" :fill="`hsl(${r.hue} 40% 75%)`" />
              <rect x="170" y="80" width="60" height="10" rx="5" :fill="`hsl(${r.hue} 40% 75%)`" />
            </svg>
            <figcaption class="photo__caption">{{ r.title }}</figcaption>
          </figure>
        </li>
      </ul>
    </section>

    <section class="block" aria-labelledby="h-license">
      <h2 id="h-license" class="block__title">Лицензия</h2>
      <div class="card info">
        <ShieldCheck :size="32" aria-hidden="true" class="info__icon" />
        <div>
          <p>
            Лицензия на осуществление медицинской деятельности № {{ clinic.license.number }} от
            {{ formatDate(clinic.license.date) }} г. выдана: {{ clinic.license.issuer }}.
          </p>
          <p class="text-muted text-small">{{ clinic.license.works }}.</p>
          <p>
            Сведения о лицензии можно проверить в едином реестре лицензий Росздравнадзора. Подробнее – на странице
            <NuxtLink to="/documents">«Документы»</NuxtLink>.
          </p>
        </div>
      </div>
    </section>

    <section class="block" aria-labelledby="h-req">
      <h2 id="h-req" class="block__title">Реквизиты</h2>
      <div class="card info">
        <Building2 :size="32" aria-hidden="true" class="info__icon" />
        <dl class="req">
          <div><dt>Полное наименование</dt><dd>{{ clinic.legalName }}</dd></div>
          <div><dt>ИНН</dt><dd>{{ clinic.inn }}</dd></div>
          <div><dt>ОГРН</dt><dd>{{ clinic.ogrn }} от {{ formatDate(clinic.ogrnDate) }} г.</dd></div>
          <div><dt>Орган, зарегистрировавший организацию</dt><dd>{{ clinic.registrar }}</dd></div>
          <div><dt>Адрес</dt><dd>{{ clinic.address.full }}</dd></div>
          <div><dt>Руководитель</dt><dd>{{ clinic.director }}</dd></div>
        </dl>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.note {
  max-width: 60ch;
}

.block {
  margin-top: var(--sp-7);

  &__title {
    margin-bottom: var(--sp-4);
  }
}

.timeline {
  display: grid;
  gap: var(--sp-4);
  padding-left: 0;
  list-style: none;
  border-left: 3px solid var(--c-primary-soft);

  &__item {
    display: grid;
    gap: var(--sp-1);
    padding-left: var(--sp-5);

    @include up(md) {
      grid-template-columns: 5rem 1fr;
      gap: var(--sp-4);
    }
  }

  &__year {
    font-weight: 700;
    font-size: var(--fs-lg);
    color: var(--c-primary);
  }
}

.equip {
  display: grid;
  gap: var(--sp-3);
  padding: 0;
  list-style: none;

  @include up(md) {
    grid-template-columns: 1fr 1fr;
  }

  li {
    display: flex;
    gap: var(--sp-2);
    align-items: flex-start;
  }

  svg {
    flex-shrink: 0;
    margin-top: 0.2rem;
    color: var(--c-primary);
  }
}

.photo-note {
  margin-bottom: var(--sp-4);
}

.photo {
  &__img {
    width: 100%;
    height: auto;
  }

  &__caption {
    margin-top: var(--sp-2);
    font-size: var(--fs-sm);
    color: var(--c-muted);
  }
}

.info {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  padding: var(--sp-5);

  @include up(md) {
    flex-direction: row;
  }

  &__icon {
    flex-shrink: 0;
    color: var(--c-primary);
  }
}

.req {
  display: grid;
  gap: var(--sp-3);

  @include up(md) {
    grid-template-columns: 1fr 1fr;
  }

  dt {
    font-size: var(--fs-sm);
    color: var(--c-muted);
  }

  dd {
    margin: 0;
    font-weight: 700;
  }
}
</style>
