import { defineConfig, devices } from '@playwright/test'

// Тесты запускаются на собранной статической версии (npm run generate)
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    locale: 'ru-RU',
    timezoneId: 'Asia/Yakutsk',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'node scripts/static-server.mjs 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
  },
})
