<script setup lang="ts">
import { MapPin, Route } from '@lucide/vue'

/**
 * Карта OpenStreetMap во встроенном фрейме (ключ API не нужен) с отметкой клиники.
 * В режиме facade фрейм загружается только по нажатию: сторонний сайт не замедляет страницу
 * и не получает данные посетителя, пока тот сам не откроет карту.
 */
const props = withDefaults(defineProps<{ lat: number; lon: number; label: string; facade?: boolean }>(), { facade: false })
const loaded = ref(!props.facade)
const d = 0.004
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
    <iframe v-if="loaded" :src="src" :title="`Карта: ${label}`" loading="lazy" class="map__frame" width="800" height="420" />
    <div v-else class="map__facade">
      <svg class="map__streets" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="400" height="250" style="fill: var(--c-primary-soft)" />
        <path d="M0 200 Q120 170 240 205 T400 190 V250 H0Z" fill="#bfe0ea" />
        <g stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round">
          <path d="M-10 70 H410" />
          <path d="M-10 140 H410" />
          <path d="M80 -10 V200" />
          <path d="M210 -10 V200" />
          <path d="M330 -10 V200" />
        </g>
      </svg>
      <MapPin :size="44" aria-hidden="true" class="map__pin" />
      <button type="button" class="btn btn--secondary map__show" data-testid="map-show" @click="loaded = true">
        Показать интерактивную карту
      </button>
    </div>
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

  &__frame,
  &__facade {
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 10;
    background: var(--c-primary-soft);
    border: 1px solid var(--c-border);
    border-radius: var(--r-lg);
  }

  &__facade {
    position: relative;
    display: grid;
    place-items: center;
    overflow: hidden;
  }

  &__streets {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  &__pin {
    position: absolute;
    top: 30%;
    left: 50%;
    color: var(--c-accent);
    transform: translate(-50%, -50%);
  }

  &__show {
    position: relative;
    margin-top: 30%;
  }

  &__links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-2);
  }
}
</style>
