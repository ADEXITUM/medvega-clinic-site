export interface Direction {
  slug: string
  title: string
  icon: string
  short: string
  description: string
}

export interface Service {
  code: string
  direction: string
  title: string
  price: number
}

export interface Doctor {
  slug: string
  name: string
  direction: string
  position: string
  experience: number
  category: string
  children: boolean
  education: string[]
  services: string[]
  about: string
}

export interface WorkHours {
  days: number[] // 1 – понедельник … 7 – воскресенье
  from: string
  to: string
}

export interface Schedule {
  slotMinutes: number
  horizonDays: number
  busyRatio: number
  doctors: Record<string, WorkHours>
}

export interface Slot {
  time: string // ЧЧ:ММ
  free: boolean
}

export interface Promo {
  slug: string
  title: string
  text: string
  direction: string
  from: string
  until: string
}

export interface Review {
  id: string
  author: string
  date: string
  rating: number
  direction: string
  doctor: string
  text: string
  pending?: boolean
}

export interface Faq {
  direction: string | null
  q: string
  a: string
}

export interface Regulator {
  name: string
  address: string
  phone: string
  url: string
}

export interface Clinic {
  name: string
  legalName: string
  shortLegalName: string
  note: string
  slogan: string
  inn: string
  ogrn: string
  ogrnDate: string
  registrar: string
  license: { number: string; date: string; issuer: string; works: string }
  address: { postalCode: string; city: string; region: string; street: string; full: string }
  geo: { lat: number; lon: number }
  phone: string
  phoneHref: string
  email: string
  hours: { days: string; time: string }[]
  hoursSchema: string[]
  directions: string
  director: string
  history: { year: string; text: string }[]
  equipment: string[]
  regulators: Regulator[]
}

export interface BookingRequest {
  direction: string
  doctor: string
  date: string // ГГГГ-ММ-ДД
  time: string
  name: string
  phone: string
  email?: string
  comment?: string
}

export interface Booking extends BookingRequest {
  id: string
  createdAt: string
  status: 'active' | 'cancelled'
}

export interface CallbackRequest {
  name: string
  phone: string
}
