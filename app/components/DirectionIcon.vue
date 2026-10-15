<script setup lang="ts">
import { Brain, Ear, Eye, HeartPulse, Mars, Scan, Stethoscope, Venus } from '@lucide/vue'

const props = withDefaults(defineProps<{ name: string; size?: number }>(), { size: 28 })
const map = { Brain, Ear, Eye, HeartPulse, Mars, Scan, Stethoscope, Venus }
const icon = computed(() => map[props.name as keyof typeof map] ?? Stethoscope)
</script>

<template>
  <component :is="icon" :size="size" aria-hidden="true" />
</template>
