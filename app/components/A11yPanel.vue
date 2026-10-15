<script setup lang="ts">
import type { FontScale, Scheme } from '~/composables/useA11y'

const { settings, panelOpen, update, reset } = useA11y()

const fonts: { value: FontScale; label: string }[] = [
  { value: '100', label: '100 %' },
  { value: '130', label: '130 %' },
  { value: '160', label: '160 %' },
]
const schemes: { value: Scheme; label: string; cls: string }[] = [
  { value: 'default', label: 'Обычная', cls: 'default' },
  { value: 'bw', label: 'Чёрным по белому', cls: 'bw' },
  { value: 'wb', label: 'Белым по чёрному', cls: 'wb' },
  { value: 'blue', label: 'Синим по голубому', cls: 'blue' },
]
</script>

<template>
  <section v-if="settings.enabled" class="a11y" aria-label="Настройки версии для слабовидящих" data-testid="a11y-panel">
    <div class="container a11y__inner">
      <button type="button" class="btn btn--text btn--sm a11y__toggle" :aria-expanded="panelOpen" @click="panelOpen = !panelOpen">
        {{ panelOpen ? 'Скрыть настройки' : 'Настройки для слабовидящих' }}
      </button>

      <div v-show="panelOpen" class="a11y__groups">
        <fieldset class="a11y__group">
          <legend>Размер шрифта</legend>
          <div class="chips">
            <button
              v-for="f in fonts"
              :key="f.value"
              type="button"
              class="chip"
              :aria-pressed="settings.font === f.value"
              @click="update({ font: f.value })"
            >
              {{ f.label }}
            </button>
          </div>
        </fieldset>

        <fieldset class="a11y__group">
          <legend>Цветовая схема</legend>
          <div class="chips">
            <button
              v-for="s in schemes"
              :key="s.value"
              type="button"
              :class="['chip', 'a11y__scheme', `a11y__scheme--${s.cls}`]"
              :aria-pressed="settings.scheme === s.value"
              :data-scheme-btn="s.value"
              @click="update({ scheme: s.value })"
            >
              {{ s.label }}
            </button>
          </div>
        </fieldset>

        <fieldset class="a11y__group">
          <legend>Изображения</legend>
          <div class="chips">
            <button type="button" class="chip" :aria-pressed="settings.images === 'on'" @click="update({ images: 'on' })">
              Показывать
            </button>
            <button type="button" class="chip" :aria-pressed="settings.images === 'off'" @click="update({ images: 'off' })">
              Скрыть
            </button>
          </div>
        </fieldset>

        <fieldset class="a11y__group">
          <legend>Межбуквенный интервал</legend>
          <div class="chips">
            <button
              type="button"
              class="chip"
              :aria-pressed="settings.spacing === 'normal'"
              @click="update({ spacing: 'normal' })"
            >
              Обычный
            </button>
            <button type="button" class="chip" :aria-pressed="settings.spacing === 'wide'" @click="update({ spacing: 'wide' })">
              Увеличенный
            </button>
          </div>
        </fieldset>

        <button type="button" class="btn btn--secondary btn--sm" @click="reset">Обычная версия сайта</button>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.a11y {
  background: var(--c-primary-soft);
  border-bottom: 2px solid var(--c-border);

  &__inner {
    padding-block: var(--sp-2);
  }

  &__groups {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-4) var(--sp-6);
    align-items: flex-end;
    padding-block: var(--sp-3);
  }

  &__group {
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;

    legend {
      margin-bottom: var(--sp-2);
      font-weight: 700;
      font-size: var(--fs-sm);
    }
  }

  // образцы схем показываются в своих цветах, чтобы выбор был нагляден
  &__scheme--bw {
    color: #000 !important;
    background: #fff !important;
    border: 2px solid #000 !important;
  }

  &__scheme--wb {
    color: #fff !important;
    background: #000 !important;
    border: 2px solid #fff !important;
    outline: 1px solid #000;
  }

  &__scheme--blue {
    color: #063462 !important;
    background: #9dd1ff !important;
    border: 2px solid #063462 !important;
  }

  &__scheme[aria-pressed='true'] {
    box-shadow: 0 0 0 3px var(--c-focus);
  }
}
</style>
