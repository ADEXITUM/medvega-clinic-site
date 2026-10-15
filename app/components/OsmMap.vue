<script setup lang="ts">
import { Route } from '@lucide/vue'

/** Карта OpenStreetMap во встроенном фрейме (ключ API не нужен) с отметкой клиники */
const props = defineProps<{ lat: number; lon: number; label: string }>()
const d = 0.006
const src = computed(
  () =>
    `https://www.openstreetmap.org/export/embed.html?bbox=${props.lon - d * 1.6},${props.lat - d},${props.lon + d * 1.6},${props.lat + d}&layer=mapnik&marker=${props.lat},${props.lon}`,
)
const route = computed(
  () => `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=%3B${props.lat}%2C${props.lon}#map=16/${props.lat}/${props.lon}`,
)
const big = computed(() => `https://www.openstreetmap.org/?mlat=${props.lat}&mlon=${props.lon}#map=17/${props.lat}/${props.lon}`)
</script>

<template>
  <div class="map">
    <iframe :src="src" :title="`Карта: ${label}`" loading="lazy" class="map__frame" width="800" height="420" />
    <div class="map__links">
      <a :href="route" target="_blank" rel="noopener" class="btn btn--primary btn--sm">
        <Route :size="18" aria-hidden="true" /> Построить маршрут
        <span class="visually-hidden">(откроется в новой вкладке)</span>
      </a>
      <a :href="big" target="_blank" rel="noopener" class="btn btn--text btn--sm">
        Открыть карту крупнее<span class="visually-hidden"> (в новой вкладке)</span>
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.map {
  display: grid;
  gap: var(--sp-3);

  &__frame {
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 10;
    background: var(--c-primary-soft);
    border: 1px solid var(--c-border);
    border-radius: var(--r-lg);
  }

  &__links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-2);
  }
}
</style>
