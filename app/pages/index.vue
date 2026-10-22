<script setup lang="ts">
import { BadgeCheck, Baby, CalendarCheck, Clock, MapPin, Microscope, Phone, Search, ShieldCheck, Star } from '@lucide/vue'
import { getClinic, getDirections, getDoctors, getFaq, getReviews } from '~/services/api'

usePageSeo({
  title: 'Многопрофильная клиника в Благовещенске',
  description:
    'Частная клиника «МедВега» в Благовещенске: 8 направлений, 16 врачей, детский приём, УЗИ и лаборатория. Онлайн-запись к врачу за 2 минуты.',
})

const [{ data: clinic }, { data: directions }, { data: doctors }, { data: reviews }, { data: faq }] = await Promise.all([
  useAsyncData('clinic', getClinic),
  useAsyncData('directions', getDirections),
  useAsyncData('doctors', () => getDoctors()),
  useAsyncData('reviews', getReviews),
  useAsyncData('faq-general', () => getFaq(null)),
])
const { active: promos } = await usePromos()
const stats = await useDoctorStats()
const next = useNextDates(() => (doctors.value ?? []).map((d) => d.slug))

const abs = useAbsoluteUrl()
useJsonLd('clinic', () => (clinic.value ? clinicJsonLd(clinic.value, abs) : null))
useJsonLd('faq', () => faqJsonLd(faq.value ?? []))

// в карусели главной – по одному врачу каждого направления (с лучшим рейтингом), полный список – в каталоге
const featured = computed(() =>
  (directions.value ?? [])
    .map((dir) =>
      (doctors.value ?? [])
        .filter((d) => d.direction === dir.slug)
        .sort((a, b) => (stats.value?.[b.slug]?.rating ?? 0) - (stats.value?.[a.slug]?.rating ?? 0))[0],
    )
    .filter((d) => !!d),
)
const dirTitle = (slug: string) => directions.value?.find((d) => d.slug === slug)?.title
const docName = (slug: string) => doctors.value?.find((d) => d.slug === slug)?.name

const activePromos = computed(() => promos.value.slice(0, 3))
const published = computed(() => (reviews.value ?? []).filter((r) => !r.pending))
const topReviews = computed(() => published.value.filter((r) => r.rating === 5).slice(0, 3))
const average = computed(() =>
  published.value.length ? formatRating(published.value.reduce((s, r) => s + r.rating, 0) / published.value.length) : '–',
)

const callback = useState('callback-open', () => false)

// быстрый поиск на первом экране ведёт на страницу поиска по сайту
const quick = ref('')
const goSearch = () => navigateTo({ path: '/search', query: quick.value.trim() ? { q: quick.value.trim() } : {} })

const advantages = [
  { icon: BadgeCheck, title: '16 опытных врачей', text: 'Средний стаж – более 13 лет, у половины высшая категория.' },
  { icon: Microscope, title: 'Своя лаборатория и УЗИ', text: 'Анализы и исследования в день обращения.' },
  { icon: Baby, title: 'Детский приём', text: 'Неврология, ЛОР, офтальмология и УЗИ для детей.' },
  { icon: CalendarCheck, title: 'Онлайн-запись 24/7', text: 'Врач и свободное время – без звонков и ожидания.' },
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
            16 врачей по 8 направлениям, УЗИ и лабораторная диагностика. Запишитесь онлайн к нужному специалисту за пару минут.
          </p>
          <form class="hero__search" role="search" aria-label="Быстрый поиск" @submit.prevent="goSearch">
            <label for="hero-search" class="visually-hidden">Врач, услуга или направление</label>
            <Search :size="20" aria-hidden="true" class="hero__search-icon" />
            <input
              id="hero-search"
              v-model="quick"
              type="search"
              class="field__control hero__search-input"
              placeholder="Врач или услуга"
              autocomplete="off"
            />
            <button type="submit" class="btn btn--secondary hero__search-btn">Найти</button>
          </form>
          <div class="hero__actions">
            <NuxtLink to="/booking" class="btn btn--primary">Записаться на приём</NuxtLink>
            <button type="button" class="btn btn--text" @click="callback = true">
              <Phone :size="18" aria-hidden="true" /> Перезвоните мне
            </button>
          </div>
          <ul class="hero__trust">
            <li><Star :size="18" aria-hidden="true" class="hero__star" /> <strong>{{ average }}</strong>&nbsp;– средняя оценка пациентов</li>
            <li><ShieldCheck :size="18" aria-hidden="true" /> Лицензия Минздрава Амурской области</li>
            <li><Baby :size="18" aria-hidden="true" /> Детский приём</li>
          </ul>
        </div>
        <div class="hero__media">
          <ClinicPhoto name="hero" alt="Врач клиники беседует с пациенткой на приёме" class="hero__photo" />
          <p class="hero__float hero__float--top"><CalendarCheck :size="18" aria-hidden="true" /> Онлайн-запись 24/7</p>
          <p class="hero__float hero__float--bottom">
            <Star :size="18" aria-hidden="true" class="hero__star" /> {{ average }} · {{ published.length }} отзывов
          </p>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="h-directions">
      <div class="container">
        <div class="section__head">
          <h2 id="h-directions" class="section__title">Направления</h2>
          <NuxtLink to="/services" class="btn btn--text">Все направления</NuxtLink>
        </div>
        <ul class="grid grid--dirs">
          <li v-for="d in directions" :key="d.slug"><LazyDirectionCard :direction="d" hydrate-on-visible /></li>
        </ul>
      </div>
    </section>

    <section class="section section--alt" aria-labelledby="h-adv">
      <div class="container">
        <h2 id="h-adv" class="section__title adv__title">Почему выбирают нас</h2>
        <ul class="grid grid--4 adv__grid">
          <li v-for="a in advantages" :key="a.title" class="adv">
            <span class="adv__icon"><component :is="a.icon" :size="26" aria-hidden="true" /></span>
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
        <DoctorsCarousel v-if="directions" :doctors="featured" :directions="directions" :stats="stats" :next="next" />
      </div>
    </section>

    <section v-if="activePromos.length" class="section section--alt" aria-labelledby="h-promo">
      <div class="container">
        <div class="section__head">
          <h2 id="h-promo" class="section__title">Акции</h2>
          <NuxtLink to="/promo" class="btn btn--text">Все акции</NuxtLink>
        </div>
        <ul class="grid grid--3">
          <li v-for="p in activePromos" :key="p.slug"><LazyPromoCard :promo="p" hydrate-on-visible /></li>
        </ul>
      </div>
    </section>

    <section class="section" aria-labelledby="h-reviews">
      <div class="container">
        <div class="section__head">
          <h2 id="h-reviews" class="section__title">Отзывы пациентов</h2>
          <NuxtLink to="/reviews" class="btn btn--text">Все {{ published.length }} отзывов</NuxtLink>
        </div>
        <ul class="grid grid--3">
          <li v-for="r in topReviews" :key="r.id">
            <LazyReviewCard :review="r" :doctor-name="docName(r.doctor)" :direction-title="dirTitle(r.direction)" hydrate-on-visible />
          </li>
        </ul>
      </div>
    </section>

    <section v-if="faq?.length" class="section section--alt" aria-labelledby="h-faq">
      <div class="container">
        <div class="faq">
          <h2 id="h-faq" class="section__title">Частые вопросы</h2>
          <AppAccordion v-for="f in faq" :key="f.q" :title="f.q">
            <p>{{ f.a }}</p>
          </AppAccordion>
        </div>
      </div>
    </section>

    <section v-if="clinic" class="section" aria-labelledby="h-find">
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
          <NuxtLink to="/contacts" class="btn btn--secondary">Все контакты</NuxtLink>
        </div>
        <OsmMap :lat="clinic.geo.lat" :lon="clinic.geo.lon" :label="`${clinic.name}, ${clinic.address.street}`" facade />
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.hero {
  padding-block: var(--sp-5) var(--sp-6);
  background: linear-gradient(180deg, var(--c-surface), var(--c-bg));

  @include up(lg) {
    padding-block: var(--sp-7);
  }

  &__inner {
    display: grid;
    gap: var(--sp-6);
    align-items: center;

    @include up(lg) {
      grid-template-columns: 1.05fr 0.95fr;
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

  &__search {
    position: relative;
    display: flex;
    gap: var(--sp-2);
    width: 100%;
    max-width: 34rem;
  }

  &__search-icon {
    position: absolute;
    top: 50%;
    left: 0.875rem;
    color: var(--c-muted);
    transform: translateY(-50%);
  }

  &__search-input {
    flex: 1;
    min-width: 0;
    min-height: 3rem;
    padding-left: 2.75rem;
    border-radius: var(--r-md);
  }

  &__search-btn {
    flex-shrink: 0;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-2) var(--sp-3);
  }

  &__trust {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-2) var(--sp-5);
    font-size: var(--fs-sm);
    color: var(--c-muted);

    li {
      display: inline-flex;
      gap: var(--sp-1);
      align-items: center;
    }

    svg {
      color: var(--c-primary);
    }
  }

  &__star {
    color: #b45309 !important;
    fill: #f59e0b;
  }

  // фото показывается с планшета; на телефоне первый экран остаётся коротким, а картинка не загружается
  &__media {
    position: relative;
    display: none;

    @include up(md) {
      display: block;
    }
  }

  &__photo {
    border-radius: var(--r-lg);
    box-shadow: var(--shadow-lg);
  }

  &__float {
    position: absolute;
    display: inline-flex;
    gap: var(--sp-2);
    align-items: center;
    padding: var(--sp-2) var(--sp-4);
    font-weight: 700;
    font-size: var(--fs-sm);
    background: var(--c-surface);
    border-radius: var(--r-full);
    box-shadow: var(--shadow-md);

    svg {
      color: var(--c-primary);
    }

    &--top {
      top: var(--sp-4);
      left: calc(var(--sp-4) * -1);
    }

    &--bottom {
      right: var(--sp-4);
      bottom: calc(var(--sp-4) * -1);
    }
  }
}

.adv {
  display: grid;
  gap: var(--sp-2);
  align-content: start;
  padding: var(--sp-4);
  background: var(--c-bg);
  border-radius: var(--r-lg);

  &__title {
    margin-bottom: var(--sp-5);
  }

  &__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--sp-3);

    @include up(lg) {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: var(--sp-5);
    }
  }

  &__icon {
    display: grid;
    place-items: center;
    width: 3rem;
    height: 3rem;
    color: var(--c-primary);
    background: var(--c-primary-soft);
    border-radius: 50%;
  }

  &__name {
    font-size: var(--fs-base);

    @include up(md) {
      font-size: var(--fs-md);
    }
  }

  p {
    font-size: var(--fs-sm);
  }
}

.faq {
  max-width: 56rem;

  .section__title {
    margin-bottom: var(--sp-5);
  }
}

.find {
  display: grid;
  gap: var(--sp-6);
  align-items: center;

  @include up(lg) {
    grid-template-columns: 1fr 1fr;
  }

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
