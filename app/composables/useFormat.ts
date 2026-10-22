const NBSP = '\u00A0'

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

/** 4.75 → «4,8» */
export const formatRating = (n: number) => n.toFixed(1).replace('.', ',')

/** Дата относительно сегодняшнего дня: «завтра», «послезавтра» или «пн, 19 октября» */
export function relativeDay(iso: string, today = new Date()) {
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  const diff = Math.round((parse(iso).getTime() - base) / 86400000)
  if (diff === 0) return 'сегодня'
  if (diff === 1) return 'завтра'
  if (diff === 2) return 'послезавтра'
  const d = formatDayShort(iso)
  return `${d.weekday}, ${d.day}${NBSP}${d.month}`
}

/** Время суток слота для группировки в мастере записи */
export function dayPart(time: string) {
  const h = Number(time.slice(0, 2))
  return h < 12 ? 'Утро' : h < 17 ? 'День' : 'Вечер'
}

/** Файл календаря .ics для записи на приём (RFC 5545) */
export function bookingIcs(b: { id: string; date: string; time: string }, title: string, location: string) {
  const [h, m] = b.time.split(':').map(Number)
  const start = `${b.date.replace(/-/g, '')}T${String(h).padStart(2, '0')}${String(m).padStart(2, '0')}00`
  const endMin = h! * 60 + m! + 30
  const end = `${b.date.replace(/-/g, '')}T${String(Math.floor(endMin / 60)).padStart(2, '0')}${String(endMin % 60).padStart(2, '0')}00`
  const esc = (s: string) => s.replace(/[,;\\]/g, (c) => '\\' + c).replace(/\u00A0/g, ' ')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MedVega//Booking//RU',
    'BEGIN:VEVENT',
    `UID:${b.id}@medvega`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART;TZID=Asia/Yakutsk:${start}`,
    `DTEND;TZID=Asia/Yakutsk:${end}`,
    `SUMMARY:${esc(title)}`,
    `LOCATION:${esc(location)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Приём в клинике МедВега',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

/** Скачивание сформированного файла (используется для .ics) */
export function downloadFile(name: string, content: string, type = 'text/calendar;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
