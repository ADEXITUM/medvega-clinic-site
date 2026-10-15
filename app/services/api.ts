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
import type {
  Booking,
  BookingRequest,
  CallbackRequest,
  Clinic,
  Direction,
  Doctor,
  Faq,
  Promo,
  Review,
  Schedule,
  Service,
  Slot,
} from '~/types'

const directions = directionsJson as Direction[]
const services = servicesJson as Service[]
const doctors = doctorsJson as Doctor[]
const schedule = scheduleJson as Schedule
const promos = promosJson as Promo[]
const reviews = reviewsJson as Review[]
const faq = faqJson as Faq[]
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

/** Рабочие дни врача на horizonDays дней вперёд, начиная с завтрашнего */
export function getWorkingDays(doctor: string, from = new Date()) {
  const hours = schedule.doctors[doctor]
  const result: { date: string; working: boolean }[] = []
  for (let i = 1; i <= schedule.horizonDays; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i)
    result.push({ date: toIsoDate(d), working: !!hours && hours.days.includes(weekday(d)) })
  }
  return delay(result, 100, 250)
}

/** Слоты по 30 минут на дату. Слот занят, если он занят в мок-расписании или уже забронирован на этом устройстве */
export function getSlots(doctor: string, date: string) {
  const hours = schedule.doctors[doctor]
  const slots: Slot[] = []
  if (hours && hours.days.includes(weekday(new Date(`${date}T00:00:00`)))) {
    const booked = new Set(
      readBookings()
        .filter((b) => b.status === 'active' && b.doctor === doctor && b.date === date)
        .map((b) => b.time),
    )
    for (let t = toMinutes(hours.from); t + schedule.slotMinutes <= toMinutes(hours.to); t += schedule.slotMinutes) {
      const time = fromMinutes(t)
      slots.push({ time, free: !isMockBusy(doctor, date, time) && !booked.has(time) })
    }
  }
  return delay(slots, 200, 400)
}

/** Ближайшие свободные окна врача (для страницы врача) */
export async function getNearestSlots(doctor: string, limit = 6) {
  const days = (await getWorkingDays(doctor)).filter((d) => d.working)
  const result: { date: string; time: string }[] = []
  for (const day of days) {
    for (const s of await getSlots(doctor, day.date)) {
      if (s.free) result.push({ date: day.date, time: s.time })
      if (result.length >= limit) return result
    }
  }
  return result
}

// ---------- записи (localStorage) ----------

function readBookings() {
  return readLocal<Booking[]>(BOOKINGS_KEY, [])
}

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
