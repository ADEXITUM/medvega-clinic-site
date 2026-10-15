<script setup lang="ts">
import { BadgeCheck, Baby, CalendarCheck, Clock, MapPin, Microscope, Phone } from '@lucide/vue'
import { getClinic, getDirections, getDoctors, getReviews, getServices } from '~/services/api'

usePageSeo({
  title: 'Многопрофильная клиника в Благовещенске',
  description:
    'Частная клиника «МедВега» в Благовещенске: 8 направлений, 16 врачей, детский приём, УЗИ и лаборатория. Онлайн-запись к врачу за 2 минуты.',
})

const [{ data: clinic }, { data: directions }, { data: doctors }, { data: services }, { data: reviews }] = await Promise.all([
  useAsyncData('clinic', getClinic),
  useAsyncData('directions', getDirections),
  useAsyncData('doctors', () => getDoctors()),
  useAsyncData('services', () => getServices()),
  useAsyncData('reviews', getReviews),
])
const { active: promos } = await usePromos()

const abs = useAbsoluteUrl()
useJsonLd('clinic', () => (clinic.value ? clinicJsonLd(clinic.value, abs) : null))

const priceFrom = (slug: string) => Math.min(...(services.value ?? []).filter((s) => s.direction === slug).map((s) => s.price))
const dirTitle = (slug: string) => directions.value?.find((d) => d.slug === slug)?.title
const docName = (slug: string) => doctors.value?.find((d) => d.slug === slug)?.name

const activePromos = computed(() => promos.value.slice(0, 3))
const topReviews = computed(() => (reviews.value ?? []).filter((r) => !r.pending && r.rating === 5).slice(0, 3))

const callback = useState('callback-open', () => false)

const advantages = [
  { icon: BadgeCheck, title: '16 опытных врачей', text: 'Средний стаж специалистов – более 13 лет, у половины высшая категория.' },
  { icon: Microscope, title: 'Своя лаборатория и УЗИ', text: 'Анализы и исследования в день обращения, без поездок в другие центры.' },
  { icon: Baby, title: 'Детский приём', text: 'Неврология, ЛОР, офтальмология и УЗИ для детей.' },
  { icon: CalendarCheck, title: 'Онлайн-запись 24/7', text: 'Выберите врача и свободное время на сайте – без звонков и ожидания.' },
]
</script>

<template>
  <div>
    <section class="hero">
      <div class="container hero__inner">
        <div class="hero__content">
          <p class="badge">Многопрофильная клиника в Благовещенске</p>
          <h1 class="hero__title">Заботимся о здоровье всей семьи</h1>
          <p class="hero__lead">
            Приём 16 врачей по 8 направлениям, УЗИ и лабораторная диагностика. Запишитесь онлайн к нужному специалисту – это
            займёт пару минут.
          </p>
          <div class="hero__actions">
            <NuxtLink to="/booking" class="btn btn--primary">Записаться на приём</NuxtLink>
            <button type="button" class="btn btn--secondary" @click="callback = true">
              <Phone :size="18" aria-hidden="true" /> Перезвоните мне
            </button>
          </div>
          <ul class="hero__facts">
            <li><strong>8</strong> направлений</li>
            <li><strong>16</strong> врачей</li>
            <li><strong>40+</strong> услуг</li>
          </ul>
        </div>
        <div class="hero__media">
          <HeroIllustration />
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="h-directions">
      <div class="container">
        <div class="section__head">
          <h2 id="h-directions" class="section__title">Направления</h2>
          <NuxtLink to="/services" class="btn btn--text">Все направления</NuxtLink>
        </div>
        <ul class="grid grid--4">
          <li v-for="d in directions" :key="d.slug">
            <DirectionCard :direction="d" :price-from="priceFrom(d.slug)" />
          </li>
        </ul>
      </div>
    </section>

    <section class="section section--alt" aria-labelledby="h-adv">
      <div class="container">
        <h2 id="h-adv" class="section__title adv__title">Почему выбирают нас</h2>
        <ul class="grid grid--4">
          <li v-for="a in advantages" :key="a.title" class="adv">
            <component :is="a.icon" :size="32" aria-hidden="true" class="adv__icon" />
            <h3 class="adv__name">{{ a.title }}</h3>
            <p class="text-muted">{{ a.text }}</p>
          </li>
        </ul>
      </div>
    </section>

    <section class="section" aria-labelledby="h-doctors">
      <div class="container">
        <div class="section__head">
          <h2 id="h-doctors" class="section__title">Наши врачи</h2>
          <NuxtLink to="/doctors" class="btn btn--text">Все врачи</NuxtLink>
        </div>
        <DoctorsCarousel v-if="doctors && directions" :doctors="doctors" :directions="directions" />
      </div>
    </section>

    <section v-if="activePromos.length" class="section section--alt" aria-labelledby="h-promo">
      <div class="container">
        <div class="section__head">
          <h2 id="h-promo" class="section__title">Акции</h2>
          <NuxtLink to="/promo" class="btn btn--text">Все акции</NuxtLink>
        </div>
        <ul class="grid grid--3">
          <li v-for="p in activePromos" :key="p.slug"><PromoCard :promo="p" /></li>
        </ul>
      </div>
    </section>

    <section class="section" aria-labelledby="h-reviews">
      <div class="container">
        <div class="section__head">
          <h2 id="h-reviews" class="section__title">Отзывы пациентов</h2>
          <NuxtLink to="/reviews" class="btn btn--text">Все отзывы</NuxtLink>
        </div>
        <ul class="grid grid--3">
          <li v-for="r in topReviews" :key="r.id">
            <ReviewCard :review="r" :doctor-name="docName(r.doctor)" :direction-title="dirTitle(r.direction)" />
          </li>
        </ul>
      </div>
    </section>

    <section v-if="clinic" class="section section--alt" aria-labelledby="h-find">
      <div class="container find">
        <div>
          <h2 id="h-find" class="section__title">Как нас найти</h2>
          <ul class="find__list">
            <li><MapPin :size="22" aria-hidden="true" /> {{ clinic.address.full }}</li>
            <li>
              <Clock :size="22" aria-hidden="true" />
              <span><template v-for="(h, i) in clinic.hours" :key="h.days">{{ i ? '; ' : '' }}{{ h.days }}: {{ h.time }}</template></span>
            </li>
            <li>
              <Phone :size="22" aria-hidden="true" /> <a :href="`tel:${clinic.phoneHref}`">{{ clinic.phone }}</a>
            </li>
          </ul>
          <p class="text-muted find__how">{{ clinic.directions }}</p>
          <NuxtLink to="/contacts" class="btn btn--secondary">Карта и схема проезда</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.hero {
  padding-block: var(--sp-6) var(--sp-7);
  background: linear-gradient(180deg, var(--c-surface), var(--c-bg));

  &__inner {
    display: grid;
    gap: var(--sp-6);
    align-items: center;

    @include up(lg) {
      grid-template-columns: 1.1fr 0.9fr;
    }
  }

  &__content {
    display: grid;
    gap: var(--sp-4);
    justify-items: start;
  }

  &__lead {
    max-width: 36rem;
    font-size: var(--fs-md);
    color: var(--c-muted);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-3);
  }

  &__facts {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-2) var(--sp-6);
    color: var(--c-muted);

    strong {
      display: block;
      font-size: var(--fs-xl);
      color: var(--c-primary);
    }
  }

  &__media {
    max-width: 30rem;
    width: 100%;
    margin-inline: auto;
  }
}

.adv {
  display: grid;
  gap: var(--sp-2);
  align-content: start;

  &__title {
    margin-bottom: var(--sp-5);
  }

  &__icon {
    color: var(--c-primary);
  }

  &__name {
    font-size: var(--fs-md);
  }
}

.find {
  &__list {
    display: grid;
    gap: var(--sp-3);
    margin-block: var(--sp-4);

    li {
      display: flex;
      gap: var(--sp-3);
      align-items: flex-start;

      svg {
        flex-shrink: 0;
        color: var(--c-primary);
      }
    }
  }

  &__how {
    max-width: 60ch;
    margin-bottom: var(--sp-4);
  }
}
</style>
