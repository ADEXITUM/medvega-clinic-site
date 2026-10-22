import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Адреса динамических страниц для статической генерации берутся из тех же JSON, что и данные сайта
const readJson = <T>(name: string): T =>
  JSON.parse(readFileSync(fileURLToPath(new URL(`./app/data/${name}.json`, import.meta.url)), 'utf8'))
const directions = readJson<{ slug: string }[]>('directions')
const doctors = readJson<{ slug: string }[]>('doctors')

const baseURL = process.env.NUXT_APP_BASE_URL || '/'

export default defineNuxtConfig({
  compatibilityDate: '2026-08-01',
  devtools: { enabled: false },
  modules: ['@nuxt/eslint'],
  ssr: true,

  app: {
    baseURL,
    head: {
      htmlAttrs: { lang: 'ru' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      titleTemplate: '%s – МедВега',
      meta: [
        { name: 'theme-color', content: '#0e6e7e' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: `${baseURL}favicon.svg` },
        { rel: 'apple-touch-icon', href: `${baseURL}apple-touch-icon.png` },
        { rel: 'manifest', href: `${baseURL}manifest.webmanifest` },
      ],
    },
  },

  css: [
    '@fontsource/manrope/cyrillic-400.css',
    '@fontsource/manrope/cyrillic-700.css',
    '@fontsource/manrope/latin-400.css',
    '@fontsource/manrope/latin-700.css',
    '~/assets/styles/main.scss',
  ],

  vite: {
    // один CSS-файл вместо десятка мелких: меньше блокирующих запросов перед первой отрисовкой на мобильной сети
    build: { cssCodeSplit: false },
    css: {
      preprocessorOptions: {
        scss: { additionalData: '@use "~/assets/styles/mixins" as *;\n' },
      },
    },
  },

  runtimeConfig: {
    public: {
      // Полный адрес опубликованного сайта (для canonical, Open Graph, sitemap); задаётся в GitHub Actions
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      failOnError: true,
      routes: [
        '/',
        '/sitemap.xml',
        '/robots.txt',
        ...directions.map((d) => `/services/${d.slug}`),
        ...doctors.map((d) => `/doctors/${d.slug}`),
      ],
    },
  },

  // стили компонентов уже собраны в общий CSS-файл – дублировать их внутри каждой HTML-страницы не нужно
  features: { inlineStyles: false },

  typescript: { strict: true },

  eslint: { config: { stylistic: false } },
})
