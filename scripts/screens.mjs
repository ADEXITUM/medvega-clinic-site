// Скриншоты для курсовой: node scripts/screens.mjs (нужен запущенный `node scripts/static-server.mjs 4173`)
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const BASE = process.env.BASE || 'http://localhost:4173'
const OUT = new URL('../docs/screens/', import.meta.url)
mkdirSync(OUT, { recursive: true })
const file = (name) => fileURLToPath(new URL(name, OUT))

const SIZES = {
  1440: { width: 1440, height: 900 },
  768: { width: 768, height: 1024 },
  375: { width: 375, height: 812 },
}

const browser = await chromium.launch()

async function open(width, url, { a11y } = {}) {
  const ctx = await browser.newContext({
    viewport: SIZES[width],
    deviceScaleFactor: width === 375 ? 2 : 1,
    locale: 'ru-RU',
    timezoneId: 'Asia/Yakutsk',
    isMobile: width === 375,
    hasTouch: width === 375,
  })
  await ctx.addInitScript((a11y) => {
    localStorage.setItem('medvega:cookies', 'ok')
    if (a11y) localStorage.setItem('medvega:a11y', JSON.stringify(a11y))
  }, a11y ?? null)
  const page = await ctx.newPage()
  await page.goto(BASE + url)
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(400)
  return { ctx, page }
}

async function shot(name, width, url, prepare, opts = {}) {
  const { ctx, page } = await open(width, url, opts)
  if (prepare) await prepare(page)
  await page.waitForTimeout(300)
  await page.screenshot({ path: file(`${name}-${width}.png`), fullPage: !!opts.fullPage })
  console.log('✓', `${name}-${width}.png`)
  await ctx.close()
}

for (const w of [1440, 768, 375]) {
  await shot('home', w, '/')
  await shot('doctors', w, '/doctors')
  await shot('doctor', w, '/doctors/smirnova-elena', (p) => p.getByTestId('nearest-slots').waitFor())
  await shot('booking-step1', w, '/booking')
  await shot('booking-step3', w, '/booking?direction=kardiologiya&doctor=smirnova-elena', (p) => p.getByTestId('calendar').waitFor())
}

// время, данные пациента и экран «Вы записаны» – через прохождение мастера
for (const w of [1440, 375]) {
  const { ctx, page } = await open(w, '/booking?direction=kardiologiya&doctor=smirnova-elena')
  await page.locator('[data-testid="calendar"] button:not([disabled])').first().click()
  await page.getByTestId('slots').waitFor()
  await page.waitForTimeout(300)
  await page.screenshot({ path: file(`booking-step4-${w}.png`) })
  await page.locator('[data-testid="slots"] button:not([disabled])').nth(2).click()
  await page.getByLabel('Фамилия, имя, отчество').fill('Петров')
  await page.getByLabel('Телефон').pressSequentially('92412')
  await page.getByTestId('booking-submit').click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: file(`booking-errors-${w}.png`), fullPage: w === 1440 })
  await page.getByLabel('Фамилия, имя, отчество').fill('Петров Пётр Петрович')
  await page.getByLabel('Телефон').fill('')
  await page.getByLabel('Телефон').pressSequentially('9241234567')
  await page.getByTestId('consent').check()
  await page.getByTestId('booking-submit').click()
  await page.getByTestId('booking-done').waitFor()
  await page.waitForTimeout(300)
  await page.screenshot({ path: file(`booking-done-${w}.png`) })
  await page.goto(BASE + '/my')
  await page.getByTestId('my-booking').first().waitFor()
  await page.waitForTimeout(300)
  await page.screenshot({ path: file(`my-${w}.png`) })
  console.log('✓ booking flow', w)
  await ctx.close()
}

// версия для слабовидящих
const a11y = { enabled: true, font: '130', scheme: 'wb', images: 'on', spacing: 'normal' }
for (const w of [1440, 375]) {
  const openPanel = (p) => p.getByRole('button', { name: 'Настройки для слабовидящих' }).click()
  await shot('a11y', w, '/', openPanel, { a11y })
  await shot('a11y-blue', w, '/doctors', null, { a11y: { ...a11y, scheme: 'blue', font: '160', spacing: 'wide' } })
}

// мобильное меню
await shot('menu', 375, '/', async (p) => {
  await p.getByTestId('burger').click()
  await p.locator('#mobile-menu').waitFor()
})

// прайс с поиском и главная целиком
await shot('prices', 1440, '/prices', (p) => p.getByTestId('price-search').fill('узи'))
await shot('home-full', 1440, '/', null, { fullPage: true })
await shot('contacts', 1440, '/contacts', (p) => p.waitForTimeout(1500))
await shot('documents', 1440, '/documents')

// картинка для Open Graph (1200×630)
{
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 } })
  const page = await ctx.newPage()
  await ctx.addInitScript(() => localStorage.setItem('medvega:cookies', 'ok'))
  await page.goto(BASE + '/')
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' })
  await page.waitForTimeout(500)
  await page.screenshot({ path: file('../../public/og-image.png') })
  await ctx.close()
}

await browser.close()

// склейка мобильных скриншотов в один рисунок: главная и меню, ошибки формы и экран «Вы записаны»
for (const [a, b, out] of [['home-375.png', 'menu-375.png', 'home-menu-375.png'], ['booking-errors-375.png', 'booking-done-375.png', 'booking-mobile-375.png']]) {
  const { readFileSync } = await import('node:fs')
  const b64 = (n) => readFileSync(file(n)).toString('base64')
  const ctx = await (await chromium.launch()).newContext({ viewport: { width: 1600, height: 1700 } })
  const page = await ctx.newPage()
  await page.setContent(
    `<div id="c" style="display:inline-flex;gap:60px;padding:0;background:#fff">${[a, b]
      .map((n) => `<img src="data:image/png;base64,${b64(n)}" style="width:750px;border:2px solid #9aa">`)
      .join('')}</div>`,
  )
  await page.locator('#c').screenshot({ path: file(out) })
  await ctx.browser().close()
  console.log('✓', out)
}
