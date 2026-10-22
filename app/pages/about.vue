<script setup lang="ts">
import { BadgeCheck, Building2, ShieldCheck } from '@lucide/vue'
import { getClinic } from '~/services/api'

usePageSeo({
  title: 'О клинике',
  description: 'История клиники «МедВега», оборудование, лицензия и реквизиты. Многопрофильная частная клиника в Благовещенске.',
})

const { data: clinic } = await useAsyncData('clinic', getClinic)

// фотографии из фотобанка Pexels (источники – в docs/images.md)
const rooms = [
  { name: 'reception', title: 'Зона ожидания и регистратура' },
  { name: 'ultrasound', title: 'Кабинет ультразвуковой диагностики' },
  { name: 'cardio', title: 'Кабинет функциональной диагностики' },
  { name: 'ophthalmology', title: 'Офтальмологический кабинет' },
  { name: 'kids', title: 'Детский приём' },
  { name: 'lab', title: 'Лаборатория' },
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
      <h2 id="h-photo" class="block__title">Клиника и оборудование</h2>
      <ul class="grid grid--3">
        <li v-for="r in rooms" :key="r.name">
          <figure class="photo">
            <ClinicPhoto :name="r.name" :alt="r.title" sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw" class="photo__img" />
            <figcaption class="photo__caption">{{ r.title }}</figcaption>
          </figure>
        </li>
      </ul>
      <p class="text-muted text-small photo-note">Фото: фотобанк Pexels.</p>
    </section>

    <section class="block" aria-labelledby="h-jobs">
      <h2 id="h-jobs" class="block__title">Вакансии</h2>
      <ul class="grid grid--3">
        <li v-for="v in clinic.vacancies" :key="v.title" class="card job">
          <h3 class="job__title">{{ v.title }}</h3>
          <p class="text-muted">{{ v.text }}</p>
          <a :href="`mailto:${clinic.email}?subject=${encodeURIComponent('Вакансия: ' + v.title)}`" class="btn btn--text btn--sm">
            Отправить резюме
          </a>
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
  margin-top: var(--sp-3);
}

.job {
  display: grid;
  gap: var(--sp-2);
  align-content: start;
  justify-items: start;
  height: 100%;
  padding: var(--sp-5);

  &__title {
    font-size: var(--fs-md);
  }
}

.photo {
  &__img {
    border-radius: var(--r-lg);
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
