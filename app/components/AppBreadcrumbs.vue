<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'

export interface Crumb {
  label: string
  to?: string
}

const props = defineProps<{ items: Crumb[] }>()
const abs = useAbsoluteUrl()

const all = computed<Crumb[]>(() => [{ label: 'Главная', to: '/' }, ...props.items])

// Микроразметка BreadcrumbList
useJsonLd('breadcrumbs', () => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: all.value.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.label,
    ...(c.to ? { item: abs(c.to) } : {}),
  })),
}))
</script>

<template>
  <nav class="crumbs" aria-label="Хлебные крошки">
    <ol class="crumbs__list">
      <li v-for="(c, i) in all" :key="i" class="crumbs__item">
        <NuxtLink v-if="c.to && i < all.length - 1" :to="c.to" class="crumbs__link">{{ c.label }}</NuxtLink>
        <span v-else aria-current="page">{{ c.label }}</span>
        <ChevronRight v-if="i < all.length - 1" :size="16" aria-hidden="true" class="crumbs__sep" />
      </li>
    </ol>
  </nav>
</template>

<style lang="scss" scoped>
.crumbs {
  margin-bottom: var(--sp-4);
  font-size: var(--fs-sm);
  color: var(--c-muted);

  &__list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0 var(--sp-1);
  }

  &__item {
    display: inline-flex;
    align-items: center;
    gap: var(--sp-1);
  }

  &__link {
    display: inline-flex;
    align-items: center;
    min-height: var(--tap);
    color: var(--c-muted);

    &:hover {
      color: var(--c-primary);
    }
  }

  &__sep {
    flex-shrink: 0;
  }
}
</style>
