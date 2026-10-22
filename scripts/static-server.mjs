// Минимальный статический сервер для проверки собранной версии (.output/public), повторяет поведение GitHub Pages:
// /doctors → /doctors/index.html, неизвестный адрес → 404.html с кодом 404.
// Запуск: node scripts/static-server.mjs [порт]
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const ROOT = fileURLToPath(new URL('../.output/public/', import.meta.url))
const PORT = Number(process.argv[2] || process.env.PORT || 4173)
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
}

async function resolve(urlPath) {
  const safe = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '')
  for (const candidate of [safe, join(safe, 'index.html'), `${safe}.html`]) {
    const file = join(ROOT, candidate)
    if (!file.startsWith(ROOT)) continue
    try {
      if ((await stat(file)).isFile()) return file
    } catch {
      /* следующий вариант */
    }
  }
  return null
}

createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname
  const file = await resolve(path)
  const target = file ?? join(ROOT, '404.html')
  try {
    let body = await readFile(target)
    const type = TYPES[extname(target)] ?? 'application/octet-stream'
    // как и GitHub Pages, текстовые ответы сжимаются gzip
    const gzip = /text|javascript|json|xml|svg/.test(type) && /gzip/.test(req.headers['accept-encoding'] ?? '')
    if (gzip) body = gzipSync(body)
    res.writeHead(file ? 200 : 404, {
      ...(gzip ? { 'content-encoding': 'gzip', vary: 'Accept-Encoding' } : {}),
      'content-type': type,
      'cache-control': path.startsWith('/_nuxt/') ? 'public, max-age=31536000, immutable' : 'no-cache',
    })
    res.end(body)
  } catch {
    res.writeHead(500).end('Server error')
  }
}).listen(PORT, () => console.log(`Static server: http://localhost:${PORT}`))
