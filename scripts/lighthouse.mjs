// Замер Lighthouse в мобильном режиме: node scripts/lighthouse.mjs
// Нужен запущенный сервер собранной версии: node scripts/static-server.mjs 4173
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'
import { chromium } from '@playwright/test'

const BASE = process.env.BASE || 'http://localhost:4173'
const PAGES = [
  { url: '/', name: 'Главная' },
  { url: '/doctors', name: 'Каталог врачей' },
  { url: '/booking', name: 'Онлайн-запись' },
]
const RUNS = 3 // берётся медиана трёх замеров
const CATS = ['performance', 'accessibility', 'best-practices', 'seo']
const LABELS = { performance: 'Performance', accessibility: 'Accessibility', 'best-practices': 'Best Practices', seo: 'SEO' }
const outDir = fileURLToPath(new URL('../docs/lighthouse/', import.meta.url))
mkdirSync(outDir, { recursive: true })

const chrome = await chromeLauncher.launch({ chromePath: chromium.executablePath(), chromeFlags: ['--headless=new'] })
const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)]
const rows = []
for (const p of PAGES) {
  const scores = Object.fromEntries(CATS.map((c) => [c, []]))
  const metrics = { fcp: [], lcp: [], tbt: [], cls: [] }
  for (let i = 0; i < RUNS; i++) {
    const r = await lighthouse(BASE + p.url, { port: chrome.port, output: 'html', onlyCategories: CATS, formFactor: 'mobile', logLevel: 'error' })
    for (const c of CATS) scores[c].push(Math.round(r.lhr.categories[c].score * 100))
    metrics.fcp.push(r.lhr.audits['first-contentful-paint'].numericValue)
    metrics.lcp.push(r.lhr.audits['largest-contentful-paint'].numericValue)
    metrics.tbt.push(r.lhr.audits['total-blocking-time'].numericValue)
    metrics.cls.push(r.lhr.audits['cumulative-layout-shift'].numericValue)
    if (i === RUNS - 1) writeFileSync(`${outDir}${p.url === '/' ? 'home' : p.url.slice(1)}.html`, r.report)
    const failed = Object.values(r.lhr.audits).filter((a) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode === 'binary')
    if (i === 0 && failed.length) console.log(p.url, 'замечания:', failed.map((a) => a.id).join(', '))
  }
  rows.push({ ...p, s: Object.fromEntries(CATS.map((c) => [c, median(scores[c])])), m: Object.fromEntries(Object.entries(metrics).map(([k, v]) => [k, median(v)])) })
  console.log(p.url, rows.at(-1).s)
}
await chrome.kill()

const fmt = (ms) => `${(ms / 1000).toFixed(1).replace('.', ',')} с`
const md = [
  '# Отчёт Lighthouse',
  '',
  `Дата замера: ${new Date().toLocaleDateString('ru-RU')}. Lighthouse ${(await import('lighthouse/package.json', { with: { type: 'json' } })).default.version}, мобильный режим (эмуляция Moto G Power, замедление сети и процессора), медиана ${RUNS} замеров. Сборка \`nuxt generate\`, локальный сервер с gzip-сжатием.`,
  '',
  '| Страница | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS |',
  '|---|---|---|---|---|---|---|---|---|',
  ...rows.map((r) => `| ${r.name} (\`${r.url}\`) | ${CATS.map((c) => r.s[c]).join(' | ')} | ${fmt(r.m.fcp)} | ${fmt(r.m.lcp)} | ${Math.round(r.m.tbt)} мс | ${r.m.cls.toFixed(3).replace('.', ',')} |`),
  '',
  `Требование ТЗ (п. 4.6): ${CATS.map((c) => `${LABELS[c]} ≥ ${c === 'performance' ? 90 : 95}`).join(', ')}.`,
  '',
  'Полные отчёты: `docs/lighthouse/*.html`.',
  '',
].join('\n')
writeFileSync(fileURLToPath(new URL('../docs/lighthouse.md', import.meta.url)), md)
console.log(md)
