// Иконки приложения (PWA, iOS) из логотипа favicon.svg: node scripts/icons.mjs
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const pub = (f) => fileURLToPath(new URL(`../public/${f}`, import.meta.url))
const svg = readFileSync(pub('favicon.svg'), 'utf8')
const browser = await chromium.launch()
for (const [name, size, pad] of [
  ['icon-192.png', 192, 0],
  ['icon-512.png', 512, 0],
  ['icon-maskable-512.png', 512, 0.12], // для «маскируемой» иконки нужен отступ от краёв
  ['apple-touch-icon.png', 180, 0],
]) {
  const page = await browser.newPage({ viewport: { width: size, height: size } })
  const inner = Math.round(size * (1 - pad * 2))
  await page.setContent(
    `<body style="margin:0;display:grid;place-items:center;width:${size}px;height:${size}px;background:#0e6e7e">
      <div style="width:${inner}px;height:${inner}px">${svg.replace('<svg ', `<svg width="${inner}" height="${inner}" `)}</div></body>`,
  )
  await page.screenshot({ path: pub(name) })
  console.log('✓', name)
  await page.close()
}
await browser.close()
