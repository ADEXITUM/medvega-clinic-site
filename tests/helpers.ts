import { expect, type Page } from '@playwright/test'

/** Собирает ошибки консоли и необработанные исключения страницы */
export function trackConsole(page: Page) {
  const errors: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(e.message))
  return errors
}

/** Закрывает cookie-баннер, чтобы он не перекрывал элементы */
export async function acceptCookies(page: Page) {
  await page.addInitScript(() => localStorage.setItem('medvega:cookies', 'ok'))
}

/** Ждёт, пока Nuxt завершит гидратацию */
export async function hydrated(page: Page) {
  // атрибут ставит плагин app/plugins/hydrated.client.ts
  await page.locator('html[data-hydrated]').waitFor({ state: 'attached' })
}

/** Проходит мастер записи до пятого шага; возвращает выбранные дату и время */
export async function walkToForm(page: Page, direction = 'terapiya', doctor = 'ivanova-anna') {
  await page.goto('/booking')
  await hydrated(page)
  await page.getByTestId(`dir-${direction}`).click()
  await page.getByTestId(`doc-${doctor}`).click()
  const day = page.locator('[data-testid="calendar"] button:not([disabled])').first()
  const date = await day.getAttribute('data-date')
  await day.click()
  const slot = page.locator('[data-testid="slots"] button:not([disabled])').first()
  const time = await slot.getAttribute('data-time')
  await slot.click()
  await expect(page.getByTestId('booking-form')).toBeVisible()
  return { date: date!, time: time! }
}
