/**
 * Слой доступа к данным.
 * Страницы и компоненты получают данные только через эти функции. Сейчас они читают локальные JSON
 * и имитируют сетевую задержку; при появлении настоящего бэкенда достаточно заменить тело функций
 * на запросы $fetch, не меняя страницы.
 */
import directionsJson from '~/data/directions.json'
import servicesJson from '~/data/services.json'
import doctorsJson from '~/data/doctors.json'
import scheduleJson from '~/data/schedule.json'
import promosJson from '~/data/promos.json'
import reviewsJson from '~/data/reviews.json'
import faqJson from '~/data/faq.json'
import clinicJson from '~/data/clinic.json'
import { typo } from '~/utils/typo'
import type {
  Booking,
  BookingRequest,
  CallbackRequest,
  Clinic,
  DayInfo,
  Direction,
  Doctor,
  DoctorStats,
  Faq,
  Promo,
  Review,
  Schedule,
  Service,
  Slot,
} from '~/types'

// Тексты для показа на экране проходят типографскую обработку один раз при загрузке модуля
const directions = (directionsJson as Direction[]).map((d) => ({ ...d, short: typo(d.short), description: typo(d.description) }))
const services = servicesJson as Service[]
const doctors = (doctorsJson as Doctor[]).map((d) => ({ ...d, about: typo(d.about) }))
const schedule = scheduleJson as Schedule
const promos = (promosJson as Promo[]).map((p) => ({ ...p, title: typo(p.title), text: typo(p.text) }))
const reviews = (reviewsJson as Review[]).map((r) => ({ ...r, text: typo(r.text) }))
const faq = (faqJson as Faq[]).map((f) => ({ ...f, q: typo(f.q), a: typo(f.a) }))
const clinic = clinicJson as Clinic

const BOOKINGS_KEY = 'medvega:bookings'
const REVIEWS_KEY = 'medvega:reviews'

/** Имитация сетевой задержки. При статической генерации задержка не нужна. */
function delay<T>(value: T, min = 150, max = 400): Promise<T> {
  if (import.meta.server) return Promise.resolve(value)
  const ms = min + Math.random() * (max - min)
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

/** Глубокая копия, чтобы страницы не могли изменить «серверные» данные */
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v))

function readLocal<T>(key: string, fallback: T): T {
  if (!import.meta.client) return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* хранилище недоступно (приватный режим) – запись останется только в памяти */
  }
}

// ---------- справочники ----------

export const getClinic = () => delay(clone(clinic))

export const getDirections = () => delay(clone(directions))

export const getDirection = (slug: string) => delay(clone(directions.find((d) => d.slug === slug) ?? null))

export const getServices = (direction?: string) =>
  delay(clone(direction ? services.filter((s) => s.direction === direction) : services))

export const getDoctors = (direction?: string) =>
  delay(clone(direction ? doctors.filter((d) => d.direction === direction) : doctors))

export const getDoctor = (slug: string) => delay(clone(doctors.find((d) => d.slug === slug) ?? null))

export const getFaq = (direction?: string | null) =>
  delay(clone(direction === undefined ? faq : faq.filter((f) => f.direction === direction)))

/**
 * Цена приёма направления: минимальная цена среди услуг «Приём…»;
 * если приёмов нет (УЗИ), берётся минимальная цена направления.
 */
export function directionPrice(slug: string) {
  const list = services.filter((s) => s.direction === slug)
  const visits = list.filter((s) => s.title.startsWith('Приём'))
  const source = visits.length ? visits : list
  return { price: Math.min(...source.map((s) => s.price)), isVisit: visits.length > 0 }
}

/** Рейтинг по отзывам, число отзывов и цена первичного приёма для каждого врача */
export function getDoctorStats() {
  const stats: Record<string, DoctorStats> = {}
  for (const d of doctors) {
    const own = reviews.filter((r) => r.doctor === d.slug)
    const visits = services.filter((s) => d.services.includes(s.code) && s.title.startsWith('Приём'))
    const all = services.filter((s) => d.services.includes(s.code))
    stats[d.slug] = {
      rating: own.length ? Math.round((own.reduce((s, r) => s + r.rating, 0) / own.length) * 10) / 10 : null,
      reviews: own.length,
      priceFrom: Math.min(...(visits.length ? visits : all).map((s) => s.price)),
    }
  }
  return delay(stats, 50, 150)
}

/**
 * Акции. По умолчанию возвращаются только действующие на сегодня.
 * Статическим страницам нужен полный список: фильтрация по дате посетителя выполняется уже в браузере (usePromos)
 */
export const getPromos = (opts: { all?: boolean; today?: Date } = {}) =>
  delay(clone(opts.all ? promos : promos.filter((p) => isPromoActive(p, opts.today))))

export function isPromoActive(p: Promo, today = new Date()) {
  const day = toIsoDate(today)
  return p.from <= day && day <= p.until
}

// ---------- расписание ----------

export function toIsoDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Дни недели 1..7 (понедельник – 1), как в schedule.json */
const weekday = (d: Date) => ((d.getDay() + 6) % 7) + 1

/** Детерминированный «псевдослучайный» признак занятости, чтобы мок-расписание не менялось при перезагрузке */
function isMockBusy(doctor: string, date: string, time: string) {
  let h = 2166136261
  for (const ch of `${doctor}|${date}|${time}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return (h >>> 0) / 4294967296 < schedule.busyRatio
}

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h! * 60 + m!
}
const fromMinutes = (n: number) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`

function readBookings() {
  return readLocal<Booking[]>(BOOKINGS_KEY, [])
}

/** Слоты врача на дату без задержки – общая основа для расписания, календаря и ближайших окон */
function computeSlots(doctor: string, date: string, booked = readBookings()): Slot[] {
  const hours = schedule.doctors[doctor]
  if (!hours || !hours.days.includes(weekday(new Date(`${date}T00:00:00`)))) return []
  const taken = new Set(
    booked.filter((b) => b.status === 'active' && b.doctor === doctor && b.date === date).map((b) => b.time),
  )
  const slots: Slot[] = []
  for (let t = toMinutes(hours.from); t + schedule.slotMinutes <= toMinutes(hours.to); t += schedule.slotMinutes) {
    const time = fromMinutes(t)
    slots.push({ time, free: !isMockBusy(doctor, date, time) && !taken.has(time) })
  }
  return slots
}

/** Дни на horizonDays вперёд, начиная с завтрашнего: рабочий ли день и сколько свободных окон */
function computeDays(doctor: string, from = new Date()): DayInfo[] {
  const booked = readBookings()
  const hours = schedule.doctors[doctor]
  const result: DayInfo[] = []
  for (let i = 1; i <= schedule.horizonDays; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i)
    const date = toIsoDate(d)
    const working = !!hours && hours.days.includes(weekday(d))
    result.push({ date, working, free: working ? computeSlots(doctor, date, booked).filter((s) => s.free).length : 0 })
  }
  return result
}

export const getWorkingDays = (doctor: string, from = new Date()) => delay(computeDays(doctor, from), 100, 250)

/** Слоты по 30 минут на дату. Слот занят, если он занят в мок-расписании или уже забронирован на этом устройстве */
export const getSlots = (doctor: string, date: string) => delay(computeSlots(doctor, date), 200, 400)

/** Ближайшие свободные окна врача (для страницы врача) */
export function getNearestSlots(doctor: string, limit = 6) {
  const result: { date: string; time: string }[] = []
  for (const day of computeDays(doctor).filter((d) => d.free)) {
    for (const s of computeSlots(doctor, day.date)) if (s.free && result.length < limit) result.push({ date: day.date, time: s.time })
    if (result.length >= limit) break
  }
  return delay(result, 150, 300)
}

/** Ближайшая свободная дата для каждого врача (каталог и шаг выбора врача) */
export function getNextFreeDates(slugs: string[]) {
  const result: Record<string, string | null> = {}
  for (const slug of slugs) result[slug] = computeDays(slug).find((d) => d.free)?.date ?? null
  return delay(result, 100, 250)
}

// ---------- записи (localStorage) ----------

export const getBookings = () => delay(readBookings())

/** Создание записи. Данные никуда не отправляются: имитируется ответ сервера через 600–1000 мс */
export async function createBooking(req: BookingRequest): Promise<Booking> {
  const slots = await getSlots(req.doctor, req.date)
  if (!slots.find((s) => s.time === req.time && s.free)) {
    throw new Error('Это время уже занято. Выберите другое.')
  }
  const booking: Booking = {
    ...req,
    id: `B${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    status: 'active',
  }
  writeLocal(BOOKINGS_KEY, [...readBookings(), booking])
  return delay(booking, 600, 1000)
}

export async function cancelBooking(id: string) {
  const list = readBookings().map((b) => (b.id === id ? { ...b, status: 'cancelled' as const } : b))
  writeLocal(BOOKINGS_KEY, list)
  return delay(true, 300, 600)
}

// ---------- отзывы ----------

export const getReviews = () =>
  delay([...readLocal<Review[]>(REVIEWS_KEY, []), ...clone(reviews)].sort((a, b) => b.date.localeCompare(a.date)))

export async function addReview(review: Omit<Review, 'id' | 'date' | 'pending'>) {
  const item: Review = { ...review, id: `u${Date.now()}`, date: toIsoDate(new Date()), pending: true }
  writeLocal(REVIEWS_KEY, [item, ...readLocal<Review[]>(REVIEWS_KEY, [])])
  return delay(item, 600, 1000)
}

// ---------- обратный звонок ----------

export function requestCallback(_req: CallbackRequest) {
  return delay({ ok: true }, 600, 1000)
}
