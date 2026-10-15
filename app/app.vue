<script setup lang="ts">
import { A11Y_BOOT_SCRIPT } from '~/composables/useA11y'

// Настройки версии для слабовидящих применяются до первой отрисовки
useHead({
  script: [{ key: 'a11y-boot', innerHTML: A11Y_BOOT_SCRIPT, tagPosition: 'head' }],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
