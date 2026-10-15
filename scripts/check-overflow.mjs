// Проверка горизонтальной прокрутки на всех страницах, ширинах и комбинациях настроек версии для слабовидящих.
// Запуск: node scripts/static-server.mjs 4173  →  node scripts/check-overflow.mjs
import { chromium } from '@playwright/test'

const BASE = process.env.BASE || 'http://localhost:4173'
const PAGES = ['/', '/services', '/services/lor', '/doctors', '/doctors/ivanova-anna', '/prices', '/booking', '/promo', '/about', '/documents', '/reviews', '/contacts', '/my', '/privacy', '/search', '/sitemap']
const WIDTHS = [320, 360, 768, 1024, 1280, 1440]
const MODES = [null]
for (const font of ['100', '130', '160'])
  for (const scheme of ['bw', 'wb', 'blue'])
    for (const spacing of ['normal', 'wide']) MODES.push({ enabled: true, font, scheme, images: 'on', spacing })
// схема влияет только на цвета, поэтому для скорости все размеры шрифта проверяются с одной схемой
const modes = MODES.filter((m) => !m || m.scheme === 'bw' || (m.font === '160' && m.spacing === 'wide'))

const browser = await chromium.launch()
let checks = 0
const problems = []
for (const mode of modes) {
  const ctx = await browser.newContext()
  await ctx.addInitScript((m) => {
    localStorage.setItem('medvega:cookies', 'ok')
    if (m) localStorage.setItem('medvega:a11y', JSON.stringify(m))
  }, mode)
  const page = await ctx.newPage()
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 })
    for (const url of PAGES) {
      await page.goto(BASE + url)
      await page.locator('html[data-hydrated]').waitFor({ state: 'attached' })
      checks++
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      if (overflow > 0) problems.push(`${JSON.stringify(mode)} ${width}px ${url}: +${overflow}px`)
    }
  }
  await ctx.close()
}
await browser.close()
console.log(`Проверок: ${checks}, с горизонтальной прокруткой: ${problems.length}`)
for (const p of problems) console.log('  ✗', p)
process.exit(problems.length ? 1 : 0)
