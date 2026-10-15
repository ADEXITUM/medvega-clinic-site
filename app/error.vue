<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const is404 = computed(() => props.error.statusCode === 404)

useSeoMeta({
  title: is404.value ? 'Страница не найдена' : 'Ошибка',
  robots: 'noindex',
})
</script>

<template>
  <NuxtLayout>
    <div class="container page err">
      <p class="err__code" aria-hidden="true">{{ error.statusCode }}</p>
      <h1 class="page__title">{{ is404 ? 'Страница не найдена' : 'Что-то пошло не так' }}</h1>
      <p class="lead">
        {{
          is404
            ? 'Возможно, страница была удалена или в адресе допущена ошибка.'
            : 'Попробуйте обновить страницу или вернитесь на главную.'
        }}
      </p>
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
  gap: var(--sp-3);
  justify-items: start;
  padding-block: var(--sp-8);

  &__code {
    font-weight: 700;
    font-size: 5rem;
    line-height: 1;
    color: var(--c-primary);
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-3);
    margin-top: var(--sp-3);
  }
}
</style>
