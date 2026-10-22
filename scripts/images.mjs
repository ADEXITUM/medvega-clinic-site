// Подготовка фотографий: скачивание с Pexels и перекодирование в WebP (1200 и 640 пикселей по ширине).
// Перекодирование выполняет Chromium через canvas, поэтому отдельные графические библиотеки не нужны.
// Запуск: node scripts/images.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

// Источники и авторы перечислены также в docs/images.md (лицензия Pexels: бесплатное использование)
export const PHOTOS = [
  { key: 'hero', id: 12599544, author: 'Lucas Guimarães Bueno' },
  { key: 'reception', id: 8459996, author: 'Los Muertos Crew' },
  { key: 'ultrasound', id: 7089299, author: 'MART PRODUCTION' },
  { key: 'ophthalmology', id: 5752287, author: 'Ksenia Chernaya' },
  { key: 'kids', id: 5998443, author: 'Pavel Danilyuk' },
  { key: 'lab', id: 4031417, author: 'Edward Jenner' },
  { key: 'cardio', id: 7108336, author: 'Pavel Danilyuk' },
]
const WIDTHS = [1200, 640]
const out = fileURLToPath(new URL('../public/images/', import.meta.url))
mkdirSync(out, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage()
for (const p of PHOTOS) {
  const url = `https://images.pexels.com/photos/${p.id}/pexels-photo-${p.id}.jpeg?auto=compress&cs=tinysrgb&w=1600`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${p.key}: HTTP ${res.status}`)
  const jpeg = Buffer.from(await res.arrayBuffer()).toString('base64')
  for (const w of WIDTHS) {
    // кадрирование 3:2, чтобы все фото в сетке были одной пропорции
    const dataUrl = await page.evaluate(
      async ({ jpeg, w }) => {
        const img = new Image()
        img.src = `data:image/jpeg;base64,${jpeg}`
        await img.decode()
        const h = Math.round((w * 2) / 3)
        const scale = Math.max(w / img.width, h / img.height)
        const sw = w / scale
        const sh = h / scale
        const c = document.createElement('canvas')
        c.width = w
        c.height = h
        c.getContext('2d').drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, 0, 0, w, h)
        return c.toDataURL('image/webp', 0.78)
      },
      { jpeg, w },
    )
    const file = `${out}${p.key}-${w}.webp`
    writeFileSync(file, Buffer.from(dataUrl.split(',')[1], 'base64'))
    console.log('✓', `${p.key}-${w}.webp`)
  }
}
await browser.close()
