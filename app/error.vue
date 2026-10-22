<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const is404 = computed(() => props.error.statusCode === 404)

useSeoMeta({
  title: is404.value ? 'Страница не найдена' : 'Ошибка',
  robots: 'noindex',
})

const q = ref('')
const search = () => clearError({ redirect: `/search${q.value.trim() ? `?q=${encodeURIComponent(q.value.trim())}` : ''}` })
const LINKS = [
  { to: '/doctors', label: 'Врачи' },
  { to: '/prices', label: 'Цены' },
  { to: '/services', label: 'Направления' },
  { to: '/contacts', label: 'Контакты' },
]
</script>

<template>
  <NuxtLayout>
    <div class="container page err">
      <p class="err__code" aria-hidden="true">{{ error.statusCode }}</p>
      <h1 class="page__title">{{ is404 ? 'Страница не найдена' : 'Что-то пошло не так' }}</h1>
      <p class="lead">
        {{
          is404
            ? 'Возможно, страница была удалена или в адресе допущена ошибка. Попробуйте найти нужное через поиск.'
            : 'Попробуйте обновить страницу или вернитесь на главную.'
        }}
      </p>
      <form class="err__search" role="search" @submit.prevent="search">
        <label for="err-search" class="visually-hidden">Поиск по сайту</label>
        <input id="err-search" v-model="q" type="search" class="field__control" placeholder="Врач, услуга или направление" />
        <button type="submit" class="btn btn--secondary">Найти</button>
      </form>
      <ul class="chips">
        <li v-for="l in LINKS" :key="l.to"><NuxtLink :to="l.to" class="chip" @click="clearError()">{{ l.label }}</NuxtLink></li>
      </ul>
      <div class="err__actions">
        <NuxtLink to="/" class="btn btn--secondary" @click="clearError()">На главную</NuxtLink>
        <NuxtLink to="/booking" class="btn btn--primary" @click="clearError()">Записаться к врачу</NuxtLink>
      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.err {
  display: grid;
  gap: var(--sp-4);
  justify-items: start;
  padding-block: var(--sp-7);

  &__code {
    font-weight: 700;
    font-size: 5rem;
    line-height: 1;
    color: var(--c-primary);
  }

  &__search {
    display: flex;
    gap: var(--sp-2);
    width: 100%;
    max-width: 32rem;

    input {
      flex: 1;
      min-width: 0;
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-3);
  }
}
</style>
