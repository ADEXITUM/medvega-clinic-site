const NBSP = ' '

/** 1500 → «1 500 ₽» (с неразрывными пробелами) */
export function formatPrice(value: number) {
  return `${String(value).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)}${NBSP}₽`
}

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
const WEEKDAYS_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']
const WEEKDAYS = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']

const parse = (iso: string) => new Date(`${iso}T00:00:00`)

/** 2026-10-15 → «15 октября 2026» */
export function formatDate(iso: string, withYear = true) {
  const d = parse(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}${withYear ? ` ${d.getFullYear()}` : ''}`
}

/** 2026-10-15 → «чт, 15 октября» */
export function formatDayShort(iso: string) {
  const d = parse(iso)
  return { weekday: WEEKDAYS_SHORT[d.getDay()]!, day: d.getDate(), month: MONTHS[d.getMonth()]!, full: `${WEEKDAYS[d.getDay()]}, ${formatDate(iso, false)}` }
}

/** Склонение: plural(5, ['год', 'года', 'лет']) → «лет» */
export function plural(n: number, forms: [string, string, string]) {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return forms[0]
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return forms[1]
  return forms[2]
}

export const experienceText = (years: number) => `${years}${NBSP}${plural(years, ['год', 'года', 'лет'])}`

/** Инициалы для аватара: «Иванова Анна Сергеевна» → «АИ» */
export function initials(name: string) {
  const [last, first] = name.split(' ')
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`
}

/** «Иванова Анна Сергеевна» → «Иванова А. С.» */
export function shortName(name: string) {
  const [last, first, middle] = name.split(' ')
  return `${last} ${first?.[0]}.${NBSP}${middle ? middle[0] + '.' : ''}`.trim()
}
