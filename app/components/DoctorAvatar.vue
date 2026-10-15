<script setup lang="ts">
/** Аватар врача с инициалами (вместо фотографии, п. 4.3 ТЗ). Цвет фона зависит от направления. */
const props = withDefaults(defineProps<{ name: string; direction: string; size?: 'md' | 'lg' }>(), { size: 'md' })
const HUES: Record<string, number> = {
  terapiya: 188,
  kardiologiya: 350,
  nevrologiya: 265,
  ginekologiya: 320,
  urologiya: 210,
  lor: 30,
  oftalmologiya: 150,
  uzi: 230,
}
const hue = computed(() => HUES[props.direction] ?? 190)
</script>

<template>
  <div
    :class="['avatar', `avatar--${size}`]"
    :style="{ '--h': hue }"
    role="img"
    :aria-label="`Аватар: ${name}`"
  >
    <span aria-hidden="true">{{ initials(name) }}</span>
  </div>
</template>

<style lang="scss" scoped>
.avatar {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 4.5rem;
  height: 4.5rem;
  font-weight: 700;
  font-size: 1.5rem;
  color: hsl(var(--h) 60% 22%);
  background: hsl(var(--h) 55% 90%);
  border-radius: 50%;

  &--lg {
    width: 9rem;
    height: 9rem;
    font-size: 3rem;
  }
}

html[data-scheme]:not([data-scheme='default']) .avatar {
  color: var(--c-text);
  background: var(--c-surface);
  border: 2px solid var(--c-text);
}
</style>
