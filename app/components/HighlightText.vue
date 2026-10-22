<script setup lang="ts">
/** Подсветка найденного фрагмента без v-html: текст разбивается на части, совпадения оборачиваются в <mark> */
const props = defineProps<{ text: string; term: string }>()
const parts = computed(() => {
  const t = props.term.trim()
  if (!t) return [{ s: props.text, hit: false }]
  const low = plain(props.text).toLocaleLowerCase('ru')
  const needle = t.toLocaleLowerCase('ru')
  const out: { s: string; hit: boolean }[] = []
  let i = 0
  for (let j = low.indexOf(needle); j !== -1; j = low.indexOf(needle, i)) {
    if (j > i) out.push({ s: props.text.slice(i, j), hit: false })
    out.push({ s: props.text.slice(j, j + needle.length), hit: true })
    i = j + needle.length
  }
  if (i < props.text.length) out.push({ s: props.text.slice(i), hit: false })
  return out
})
</script>

<template>
  <span><template v-for="(p, i) in parts" :key="i"><mark v-if="p.hit" class="hl">{{ p.s }}</mark><template v-else>{{ p.s }}</template></template></span>
</template>

<style scoped>
.hl {
  padding: 0 1px;
  color: inherit;
  background: #fde68a;
  border-radius: 2px;
}
</style>
