<script setup lang="ts">
import { Eye, Menu, Phone, Search, X } from '@lucide/vue'
import { getClinic } from '~/services/api'

const { data: clinic } = await useAsyncData('clinic', getClinic)
const { settings, toggle } = useA11y()

const menuOpen = ref(false)
const panel = ref<HTMLElement | null>(null)
const burger = ref<HTMLButtonElement | null>(null)
const route = useRoute()

function close(returnFocus = true) {
  if (!menuOpen.value) return
  menuOpen.value = false
  if (returnFocus) burger.value?.focus()
}

// панель закрывается при переходе по ссылке, по Esc и по клику вне неё
watch(() => route.fullPath, () => close(false))

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

// composedPath, а не target: к моменту всплытия иконка в кнопке уже перерисована и target отсоединён от DOM
function onOutside(e: MouseEvent) {
  const path = e.composedPath()
  if (menuOpen.value && panel.value && !path.includes(panel.value) && !(burger.value && path.includes(burger.value))) close(false)
}

watch(menuOpen, async (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (open) {
    await nextTick()
    panel.value?.querySelector<HTMLElement>('a, button')?.focus()
  }
})

// если окно расширили и бургер скрылся, панель закрывается
function onResize() {
  if (menuOpen.value && burger.value && getComputedStyle(burger.value).display === 'none') close(false)
}

onMounted(() => {
  document.addEventListener('keydown', onKey)
  document.addEventListener('click', onOutside)
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  document.removeEventListener('click', onOutside)
  window.removeEventListener('resize', onResize)
  document.body.style.overflow = ''
})
</script>

<template>
  <header class="header">
    <div class="container header__inner">
      <AppLogo />

      <nav class="header__nav" aria-label="Главное меню">
        <ul class="header__list">
          <li v-for="item in MAIN_NAV" :key="item.to">
            <NuxtLink :to="item.to" class="header__link">{{ item.label }}</NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="header__actions">
        <NuxtLink to="/search" class="icon-btn header__search" title="Поиск по сайту">
          <Search :size="22" aria-hidden="true" />
          <span class="visually-hidden">Поиск по сайту</span>
        </NuxtLink>
        <a v-if="clinic" :href="`tel:${clinic.phoneHref}`" class="header__phone">
          <Phone :size="20" aria-hidden="true" />
          <span class="header__phone-text">{{ clinic.phone }}</span>
          <span class="visually-hidden">Позвонить в клинику</span>
        </a>
        <button
          type="button"
          class="icon-btn header__a11y"
          :aria-pressed="settings.enabled"
          :title="settings.enabled ? 'Обычная версия сайта' : 'Версия для слабовидящих'"
          data-testid="a11y-toggle"
          @click="toggle"
        >
          <Eye :size="24" aria-hidden="true" />
          <span class="visually-hidden">{{ settings.enabled ? 'Обычная версия сайта' : 'Версия для слабовидящих' }}</span>
        </button>
        <NuxtLink to="/booking" class="btn btn--primary header__cta">Записаться</NuxtLink>
        <button
          ref="burger"
          type="button"
          class="icon-btn header__burger"
          :aria-expanded="menuOpen"
          aria-controls="mobile-menu"
          data-testid="burger"
          @click="menuOpen = !menuOpen"
        >
          <X v-if="menuOpen" :size="26" aria-hidden="true" />
          <Menu v-else :size="26" aria-hidden="true" />
          <span class="visually-hidden">{{ menuOpen ? 'Закрыть меню' : 'Открыть меню' }}</span>
        </button>
      </div>
    </div>

    <div
      v-show="menuOpen"
      id="mobile-menu"
      ref="panel"
      class="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Меню сайта"
    >
      <nav aria-label="Мобильное меню" class="container">
        <ul class="mobile-menu__list">
          <li><NuxtLink to="/" class="mobile-menu__link">Главная</NuxtLink></li>
          <li v-for="item in MAIN_NAV" :key="item.to">
            <NuxtLink :to="item.to" class="mobile-menu__link">{{ item.label }}</NuxtLink>
          </li>
          <li><NuxtLink to="/documents" class="mobile-menu__link">Документы</NuxtLink></li>
          <li><NuxtLink to="/my" class="mobile-menu__link">Мои записи</NuxtLink></li>
          <li><NuxtLink to="/search" class="mobile-menu__link">Поиск по сайту</NuxtLink></li>
        </ul>
        <div class="mobile-menu__footer">
          <NuxtLink to="/booking" class="btn btn--primary btn--block">Записаться на приём</NuxtLink>
          <a v-if="clinic" :href="`tel:${clinic.phoneHref}`" class="btn btn--secondary btn--block">
            <Phone :size="20" aria-hidden="true" /> {{ clinic.phone }}
          </a>
        </div>
      </nav>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--c-surface);
  border-bottom: 1px solid var(--c-border);

  &__inner {
    display: flex;
    align-items: center;
    gap: var(--sp-3);
    min-height: var(--header-h);
  }

  &__nav {
    display: none;
    margin-inline: auto;

    @include up(lg) {
      display: block;
    }
  }

  &__list {
    display: flex;
    gap: var(--sp-1);
  }

  &__link {
    display: inline-flex;
    align-items: center;
    min-height: var(--tap);
    padding-inline: var(--sp-2);
    font-weight: 700;
    font-size: var(--fs-sm);
    color: var(--c-text);
    text-decoration: none;
    border-radius: var(--r-sm);

    @include up(xl) {
      padding-inline: var(--sp-3);
      font-size: var(--fs-base);
    }

    &:hover,
    &.router-link-active {
      color: var(--c-primary);
    }

    &.router-link-active {
      text-decoration: underline;
      text-underline-offset: 0.35em;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: var(--sp-1);
    margin-left: auto;

    @include up(lg) {
      margin-left: 0;
    }
  }

  &__search {
    display: none;

    @include up(md) {
      display: inline-flex;
    }
  }

  &__phone {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--sp-2);
    min-width: var(--tap);
    min-height: var(--tap);
    font-weight: 700;
    color: var(--c-text);
    text-decoration: none;
    white-space: nowrap;
  }

  &__phone-text {
    display: none;

    @include up(xl) {
      display: inline;
    }
  }

  &__cta {
    display: none;

    @include up(md) {
      display: inline-flex;
    }
  }

  &__burger {
    @include up(lg) {
      display: none;
    }
  }
}

.mobile-menu {
  position: fixed;
  inset: var(--header-h) 0 0;
  z-index: 49;
  overflow-y: auto;
  padding-block: var(--sp-4) var(--sp-6);
  background: var(--c-surface);

  &__list {
    display: grid;
  }

  &__link {
    display: flex;
    align-items: center;
    min-height: 3.25rem;
    font-weight: 700;
    font-size: var(--fs-md);
    color: var(--c-text);
    text-decoration: none;
    border-bottom: 1px solid var(--c-border);

    &.router-link-exact-active {
      color: var(--c-primary);
    }
  }

  &__footer {
    display: grid;
    gap: var(--sp-3);
    margin-top: var(--sp-5);
  }
}
</style>
