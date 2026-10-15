<script setup lang="ts">
import { Clock, Mail, MapPin, Phone } from '@lucide/vue'
import { getClinic } from '~/services/api'

const { data: clinic } = await useAsyncData('clinic', getClinic)
const callback = useState('callback-open', () => false)
</script>

<template>
  <footer v-if="clinic" class="footer">
    <div class="footer__warning">
      <div class="container">ИМЕЮТСЯ ПРОТИВОПОКАЗАНИЯ. НЕОБХОДИМО ПРОКОНСУЛЬТИРОВАТЬСЯ СО СПЕЦИАЛИСТОМ</div>
    </div>
    <div class="container footer__grid">
      <div class="footer__col">
        <AppLogo />
        <p class="footer__text">{{ clinic.slogan }}</p>
        <button type="button" class="btn btn--secondary btn--sm" @click="callback = true">Заказать обратный звонок</button>
      </div>

      <div class="footer__col">
        <h2 class="footer__title">Контакты</h2>
        <ul class="footer__list">
          <li>
            <MapPin :size="18" aria-hidden="true" />
            <span>{{ clinic.address.full }}</span>
          </li>
          <li>
            <Phone :size="18" aria-hidden="true" />
            <a :href="`tel:${clinic.phoneHref}`">{{ clinic.phone }}</a>
          </li>
          <li>
            <Mail :size="18" aria-hidden="true" />
            <a :href="`mailto:${clinic.email}`">{{ clinic.email }}</a>
          </li>
        </ul>
      </div>

      <div class="footer__col">
        <h2 class="footer__title">Режим работы</h2>
        <ul class="footer__list">
          <li v-for="h in clinic.hours" :key="h.days">
            <Clock :size="18" aria-hidden="true" />
            <span>{{ h.days }}: {{ h.time }}</span>
          </li>
        </ul>
      </div>

      <nav class="footer__col" aria-label="Документы">
        <h2 class="footer__title">Пациентам</h2>
        <ul class="footer__links">
          <li v-for="item in FOOTER_DOCS" :key="item.to">
            <NuxtLink :to="item.to">{{ item.label }}</NuxtLink>
          </li>
        </ul>
      </nav>
    </div>

    <div class="container footer__legal">
      <p>
        {{ clinic.shortLegalName }}, ИНН {{ clinic.inn }}, ОГРН {{ clinic.ogrn }}. Лицензия на медицинскую деятельность
        № {{ clinic.license.number }} от {{ formatDate(clinic.license.date) }} г., выдана: {{ clinic.license.issuer }}.
      </p>
      <p>
        {{ clinic.note }} Сайт выполнен в рамках курсовой работы; данные, введённые в формы, хранятся только в вашем браузере
        и никуда не передаются.
      </p>
      <p>© 2026 МедВега</p>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.footer {
  margin-top: auto;
  color: var(--c-text);
  background: var(--c-surface);
  border-top: 1px solid var(--c-border);

  &__warning {
    padding-block: var(--sp-3);
    font-weight: 700;
    font-size: var(--fs-sm);
    text-align: center;
    color: var(--c-text);
    background: var(--c-primary-soft);
  }

  &__grid {
    display: grid;
    gap: var(--sp-6);
    padding-block: var(--sp-7) var(--sp-5);

    @include up(md) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @include up(lg) {
      grid-template-columns: 1.3fr 1.2fr 1fr 1.2fr;
    }
  }

  &__col {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--sp-3);
  }

  &__text {
    color: var(--c-muted);
  }

  &__title {
    font-size: var(--fs-md);
  }

  &__list {
    display: grid;
    gap: var(--sp-2);

    li {
      display: flex;
      gap: var(--sp-2);
      align-items: flex-start;

      svg {
        flex-shrink: 0;
        margin-top: 0.25rem;
        color: var(--c-primary);
      }
    }
  }

  &__links {
    display: grid;

    a {
      display: inline-flex;
      align-items: center;
      min-height: var(--tap);
    }
  }

  &__legal {
    padding-block: var(--sp-5) var(--sp-6);
    font-size: var(--fs-xs);
    color: var(--c-muted);
    border-top: 1px solid var(--c-border);
  }
}
</style>
