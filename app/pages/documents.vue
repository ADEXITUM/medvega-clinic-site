<script setup lang="ts">
import { FileText, ShieldCheck } from '@lucide/vue'
import { getClinic } from '~/services/api'

usePageSeo({
  title: 'Документы и лицензия',
  description:
    'Лицензия, правила предоставления платных медицинских услуг, образец договора, политика обработки персональных данных и контролирующие органы клиники «МедВега».',
})

const { data: clinic } = await useAsyncData('clinic', getClinic)
</script>

<template>
  <div v-if="clinic" class="container page">
    <AppBreadcrumbs :items="[{ label: 'Документы' }]" />
    <h1 class="page__title">Документы</h1>
    <p class="lead page__lead">
      Информация размещена в соответствии с Правилами предоставления медицинскими организациями платных медицинских услуг
      (постановление Правительства РФ от 30.05.2026 № 659), статьёй 79 Федерального закона от 21.11.2011 № 323-ФЗ и приказом
      Минздрава России от 13.03.2025 № 118н.
    </p>
    <p class="notice note">{{ clinic.note }}</p>

    <nav class="toc card" aria-label="Разделы страницы">
      <ul>
        <li><a href="#org">Сведения об организации</a></li>
        <li><a href="#license">Лицензия</a></li>
        <li><a href="#rules">Правила предоставления платных услуг</a></li>
        <li><a href="#contract">Образец договора</a></li>
        <li><a href="#appointment">Запись на приём и подготовка</a></li>
        <li><a href="#standards">Стандарты и клинические рекомендации</a></li>
        <li><a href="#rights">Права и обязанности пациентов</a></li>
        <li><a href="#pdn">Персональные данные</a></li>
        <li><a href="#regulators">Контролирующие органы</a></li>
      </ul>
    </nav>

    <section id="org" class="block" aria-labelledby="h-org">
      <h2 id="h-org" class="block__title">Сведения об организации</h2>
      <dl class="req card">
        <div><dt>Полное наименование</dt><dd>{{ clinic.legalName }}</dd></div>
        <div><dt>Сокращённое наименование</dt><dd>{{ clinic.shortLegalName }}</dd></div>
        <div><dt>Адрес места нахождения</dt><dd>{{ clinic.address.full }}</dd></div>
        <div>
          <dt>ОГРН, дата внесения записи в ЕГРЮЛ</dt>
          <dd>{{ clinic.ogrn }}, {{ formatDate(clinic.ogrnDate) }} г.</dd>
        </div>
        <div><dt>Регистрирующий орган</dt><dd>{{ clinic.registrar }}</dd></div>
        <div><dt>ИНН</dt><dd>{{ clinic.inn }}</dd></div>
        <div>
          <dt>Режим работы</dt>
          <dd><template v-for="(h, i) in clinic.hours" :key="h.days">{{ i ? '; ' : '' }}{{ h.days }}: {{ h.time }}</template></dd>
        </div>
        <div><dt>Руководитель</dt><dd>{{ clinic.director }}</dd></div>
      </dl>
      <p class="text-muted text-small">
        Сведения о медицинских работниках (образование, квалификация, график работы) – на страницах
        <NuxtLink to="/doctors">врачей</NuxtLink>. Перечень платных услуг с ценами – в разделе <NuxtLink to="/prices">«Цены»</NuxtLink>.
      </p>
    </section>

    <section id="license" class="block" aria-labelledby="h-license">
      <h2 id="h-license" class="block__title">Лицензия</h2>
      <div class="doc card">
        <ShieldCheck :size="32" aria-hidden="true" class="doc__icon" />
        <div>
          <p>
            <strong>Лицензия на осуществление медицинской деятельности № {{ clinic.license.number }}</strong> от
            {{ formatDate(clinic.license.date) }} г.
          </p>
          <p>Лицензирующий орган: {{ clinic.license.issuer }}.</p>
          <p class="text-muted text-small">Перечень работ (услуг): {{ clinic.license.works }}.</p>
        </div>
      </div>
    </section>

    <section id="rules" class="block prose" aria-labelledby="h-rules">
      <h2 id="h-rules" class="block__title">Правила предоставления платных медицинских услуг</h2>
      <ol>
        <li>Платные медицинские услуги оказываются на основании договора, заключаемого с пациентом или заказчиком в письменной форме.</li>
        <li>
          До заключения договора пациенту предоставляется информация о порядке оказания услуг, их стоимости и сроках, а также о
          возможности получения медицинской помощи бесплатно в рамках программы государственных гарантий.
        </li>
        <li>Медицинские услуги оказываются при наличии информированного добровольного согласия пациента.</li>
        <li>Оплата производится наличными или банковской картой; пациенту выдаётся кассовый чек.</li>
        <li>
          Претензии рассматриваются руководством клиники в течение 10 рабочих дней. Пациент вправе обратиться в контролирующие
          органы, указанные ниже.
        </li>
      </ol>
      <p class="text-muted text-small">
        Основание: постановление Правительства Российской Федерации от 30.05.2026 № 659 «Об утверждении Правил предоставления
        медицинскими организациями платных медицинских услуг» (действует с 01.09.2026 и заменило постановление от 11.05.2023
        № 736).
      </p>
    </section>

    <section id="contract" class="block" aria-labelledby="h-contract">
      <h2 id="h-contract" class="block__title">Образец договора</h2>
      <div class="doc card">
        <FileText :size="32" aria-hidden="true" class="doc__icon" />
        <div class="prose">
          <p><strong>Договор на оказание платных медицинских услуг (образец)</strong></p>
          <p class="text-small">
            Договор содержит: сведения об исполнителе и потребителе; перечень услуг; стоимость, сроки и порядок оплаты; условия и
            сроки оказания услуг; права и ответственность сторон; порядок изменения и расторжения договора. Подписанный экземпляр
            выдаётся пациенту. Полный текст договора можно получить в регистратуре.
          </p>
        </div>
      </div>
    </section>

    <section id="appointment" class="block prose" aria-labelledby="h-appointment">
      <h2 id="h-appointment" class="block__title">Правила записи на первичный приём и подготовка к исследованиям</h2>
      <ul>
        <li>
          Записаться можно <NuxtLink to="/booking">онлайн</NuxtLink>, по телефону {{ clinic.phone }} или в регистратуре. Направление
          не требуется.
        </li>
        <li>На приём возьмите паспорт; для ребёнка – свидетельство о рождении и паспорт законного представителя.</li>
        <li>Приходите за 10 минут до начала приёма, чтобы оформить договор и информированное согласие.</li>
        <li>
          Правила подготовки к УЗИ, ЭКГ, ЭЭГ и другим исследованиям приведены в разделе «Частые вопросы» на странице каждого
          <NuxtLink to="/services">направления</NuxtLink>.
        </li>
      </ul>
    </section>

    <section id="standards" class="block prose" aria-labelledby="h-standards">
      <h2 id="h-standards" class="block__title">Стандарты медицинской помощи и клинические рекомендации</h2>
      <p>
        Медицинская помощь оказывается на основе клинических рекомендаций и с учётом стандартов медицинской помощи. Тексты
        документов опубликованы на официальных ресурсах:
      </p>
      <ul>
        <li>
          <a href="http://pravo.gov.ru" target="_blank" rel="noopener">Официальный интернет-портал правовой информации</a>
          – стандарты медицинской помощи;
        </li>
        <li>
          <a href="https://cr.minzdrav.gov.ru" target="_blank" rel="noopener">Рубрикатор клинических рекомендаций</a> Минздрава
          России.
        </li>
      </ul>
    </section>

    <section id="rights" class="block prose" aria-labelledby="h-rights">
      <h2 id="h-rights" class="block__title">Права и обязанности пациентов</h2>
      <p>
        Права и обязанности граждан в сфере охраны здоровья установлены главой 4 Федерального закона № 323-ФЗ. Пациент имеет право
        на выбор врача, получение информации о состоянии своего здоровья, защиту сведений, составляющих врачебную тайну, отказ от
        медицинского вмешательства. Пациент обязан заботиться о сохранении своего здоровья и соблюдать режим лечения и правила
        поведения в медицинской организации.
      </p>
    </section>

    <section id="pdn" class="block" aria-labelledby="h-pdn">
      <h2 id="h-pdn" class="block__title">Персональные данные</h2>
      <p>
        Обработка персональных данных пациентов ведётся в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О
        персональных данных». Ознакомьтесь с <NuxtLink to="/privacy">политикой обработки персональных данных</NuxtLink>.
      </p>
    </section>

    <section id="regulators" class="block" aria-labelledby="h-reg">
      <h2 id="h-reg" class="block__title">Контролирующие органы</h2>
      <ul class="grid grid--3">
        <li v-for="r in clinic.regulators" :key="r.name" class="card reg">
          <h3 class="reg__name">{{ r.name }}</h3>
          <p>{{ r.address }}</p>
          <p>Телефон: {{ r.phone }}</p>
          <p>
            <a :href="r.url" target="_blank" rel="noopener">{{ r.url.replace('https://', '') }}<span class="visually-hidden"> (в новой вкладке)</span></a>
          </p>
        </li>
      </ul>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.note {
  max-width: 60ch;
}

.toc {
  padding: var(--sp-4) var(--sp-5);
  margin-top: var(--sp-5);

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 0 var(--sp-5);
  }

  a {
    display: inline-flex;
    align-items: center;
    min-height: var(--tap);
  }
}

.block {
  margin-top: var(--sp-7);
  scroll-margin-top: calc(var(--header-h) + var(--sp-4));

  &__title {
    margin-bottom: var(--sp-4);
    font-size: var(--fs-xl);
  }
}

.req {
  display: grid;
  gap: var(--sp-3);
  padding: var(--sp-5);
  margin-bottom: var(--sp-3);

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

.doc {
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

.reg {
  display: grid;
  gap: var(--sp-2);
  align-content: start;
  height: 100%;
  padding: var(--sp-5);
  font-size: var(--fs-sm);

  &__name {
    font-size: var(--fs-base);
  }
}
</style>
