import directions from '../../app/data/directions.json'
import doctors from '../../app/data/doctors.json'

// sitemap.xml формируется при статической генерации из тех же данных, что и страницы
const STATIC = ['/', '/services', '/doctors', '/prices', '/booking', '/promo', '/reviews', '/about', '/documents', '/contacts', '/privacy', '/sitemap']

export default defineEventHandler((event) => {
  const base = String(useRuntimeConfig(event).public.siteUrl).replace(/\/$/, '')
  const today = new Date().toISOString().slice(0, 10)
  const urls = [
    ...STATIC,
    ...directions.map((d) => `/services/${d.slug}`),
    ...doctors.map((d) => `/doctors/${d.slug}`),
  ]
  const body = urls
    .map((u) => `  <url><loc>${base}${u === '/' ? '/' : u}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n')
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
})
