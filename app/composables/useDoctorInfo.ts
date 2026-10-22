import { getDoctorStats, getNextFreeDates } from '~/services/api'

/** Рейтинг, число отзывов и цена приёма врачей – статичны, попадают в сгенерированный HTML */
export async function useDoctorStats() {
  const { data } = await useAsyncData('doctor-stats', getDoctorStats)
  return data
}

/**
 * Ближайшие свободные даты зависят от сегодняшнего дня и записей на устройстве,
 * поэтому считаются в браузере после монтирования.
 */
export function useNextDates(slugs: () => string[]) {
  const next = ref<Record<string, string | null>>({})
  onMounted(async () => {
    next.value = await getNextFreeDates(slugs())
  })
  return next
}
