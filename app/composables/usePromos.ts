import { getPromos, isPromoActive } from '~/services/api'

/**
 * Действующие акции. HTML страницы генерируется заранее, поэтому дата сравнивается дважды:
 * при сборке и ещё раз в браузере посетителя – акция с истёкшим сроком скрывается автоматически.
 */
export async function usePromos() {
  // до монтирования используется дата сборки (передаётся в payload), чтобы гидратация совпала с HTML;
  // composables вызываются до await, иначе теряется контекст Nuxt
  const buildDate = useState('build-date', () => new Date().toISOString())
  const today = ref(new Date(buildDate.value))
  onMounted(() => (today.value = new Date()))
  const { data } = await useAsyncData('promos-all', () => getPromos({ all: true }))
  const active = computed(() => (data.value ?? []).filter((p) => isPromoActive(p, today.value)))
  return { active }
}
