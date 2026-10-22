/**
 * SEO страницы: уникальные title и description, Open Graph, canonical и (по желанию) JSON-LD.
 */
export function useAbsoluteUrl() {
  const { siteUrl } = useRuntimeConfig().public
  const base = String(siteUrl).replace(/\/$/, '')
  return (path: string) => `${base}${path === '/' ? '/' : path.replace(/\/$/, '')}`
}

export function usePageSeo(opts: { title: string; description: string; path?: string; image?: string }) {
  const route = useRoute()
  const abs = useAbsoluteUrl()
  const url = abs(opts.path ?? route.path)
  useSeoMeta({
    title: opts.title,
    description: opts.description,
    ogTitle: `${opts.title} – МедВега`,
    ogDescription: opts.description,
    ogType: 'website',
    ogUrl: url,
    ogLocale: 'ru_RU',
    ogSiteName: 'МедВега',
    ogImage: abs('/og-image.png'),
    twitterCard: 'summary_large_image',
  })
  useHead({ link: [{ rel: 'canonical', href: url }] })
}

/** Встраивает объект schema.org в <head> как <script type="application/ld+json"> */
export function useJsonLd(key: string, data: () => Record<string, unknown> | null) {
  useHead(() => {
    const value = data()
    return value
      ? { script: [{ key: `ld-${key}`, type: 'application/ld+json', innerHTML: JSON.stringify(value) }] }
      : {}
  })
}

/** MedicalClinic – на главной и в контактах */
export function clinicJsonLd(clinic: import('~/types').Clinic, abs: (p: string) => string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: clinic.name,
    legalName: clinic.shortLegalName,
    url: abs('/'),
    telephone: clinic.phoneHref,
    email: clinic.email,
    image: abs('/og-image.png'),
    priceRange: '350–3500 ₽',
    address: {
      '@type': 'PostalAddress',
      streetAddress: clinic.address.street,
      addressLocality: clinic.address.city,
      addressRegion: clinic.address.region,
      postalCode: clinic.address.postalCode,
      addressCountry: 'RU',
    },
    geo: { '@type': 'GeoCoordinates', latitude: clinic.geo.lat, longitude: clinic.geo.lon },
    openingHours: clinic.hoursSchema,
    medicalSpecialty: ['PrimaryCare', 'Cardiovascular', 'Neurologic', 'Gynecologic', 'Urologic', 'Otolaryngologic', 'Optometric', 'Radiography'],
  }
}

/** FAQPage – вопросы и ответы на главной и на страницах направлений */
export function faqJsonLd(items: import('~/types').Faq[]) {
  if (!items.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: plain(f.q),
      acceptedAnswer: { '@type': 'Answer', text: plain(f.a) },
    })),
  }
}
