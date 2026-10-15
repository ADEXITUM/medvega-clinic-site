// Экспорт схем Mermaid в PNG: node scripts/diagrams.mjs
// Используется @mermaid-js/mermaid-cli с браузером Chromium, установленным Playwright
import { execFileSync } from 'node:child_process'
import { readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const dir = fileURLToPath(new URL('../docs/diagrams/', import.meta.url))
const puppeteerCfg = join(dir, '.puppeteer.json')
const mermaidCfg = join(dir, '.mermaid.json')
writeFileSync(puppeteerCfg, JSON.stringify({ executablePath: chromium.executablePath(), args: ['--no-sandbox'] }))
writeFileSync(
  mermaidCfg,
  JSON.stringify({
    theme: 'base',
    themeVariables: {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      primaryColor: '#ffffff',
      primaryBorderColor: '#17262f',
      primaryTextColor: '#17262f',
      lineColor: '#17262f',
      textColor: '#17262f',
    },
    flowchart: { htmlLabels: true, curve: 'basis' },
    er: { fontSize: 16 },
  }),
)

const mmdc = fileURLToPath(new URL('../node_modules/@mermaid-js/mermaid-cli/src/cli.js', import.meta.url))
for (const f of readdirSync(dir).filter((x) => x.endsWith('.mmd'))) {
  const out = join(dir, f.replace(/\.mmd$/, '.png'))
  execFileSync(
    process.execPath,
    [mmdc, '-i', join(dir, f), '-o', out, '-b', 'white', '--size', '1600', '-s', '1', '-c', mermaidCfg, '-p', puppeteerCfg],
    { stdio: 'inherit' },
  )
  console.log('✓', out)
}
