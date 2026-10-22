<script setup lang="ts">
/**
 * Фотография в WebP двух размеров (640 и 1200 пикселей) с адаптивным srcset.
 * Ширина и высота заданы явно – браузер резервирует место и вёрстка не «прыгает» при загрузке.
 * Путь учитывает базовый адрес сайта на GitHub Pages (/medvega-clinic-site/).
 */
const props = withDefaults(
  defineProps<{ name: string; alt: string; sizes?: string; eager?: boolean }>(),
  { sizes: '(min-width: 1024px) 600px, 100vw', eager: false },
)
const base = useRuntimeConfig().app.baseURL.replace(/\/$/, '')
const src = (w: number) => `${base}/images/${props.name}-${w}.webp`
</script>

<template>
  <img
    class="photo-img"
    :src="src(640)"
    :srcset="`${src(640)} 640w, ${src(1200)} 1200w`"
    :sizes="sizes"
    :alt="alt"
    width="1200"
    height="800"
    :loading="eager ? 'eager' : 'lazy'"
    :fetchpriority="eager ? 'high' : 'auto'"
    decoding="async"
  />
</template>

<style scoped>
.photo-img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 3 / 2;
  object-fit: cover;
  background: var(--c-primary-soft);
}
</style>
