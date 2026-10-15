import { expect, test } from '@playwright/test'
import { acceptCookies, hydrated, trackConsole } from './helpers'

const PAGES = [
  '/',
  '/services',
  '/services/kardiologiya',
  '/doctors',
  '/doctors/ivanova-anna',
  '/prices',
  '/booking',
  '/promo',
  '/about',
  '/documents',
  '/reviews',
  '/contacts',
  '/my',
  '/privacy',
  '/search',
  '/sitemap',
]
const WIDTHS = [320, 360, 768, 1024, 1440]

test.describe('ТК-15. Вёрстка без горизонтальной прокрутки и ошибок в консоли', () => {
  test.skip(({ isMobile }) => isMobile, 'проверяется в одном проекте')

  for (const url of PAGES) {
    test(`страница ${url}`, async ({ page }) => {
      await acceptCookies(page)
      const errors = trackConsole(page)
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 })
        await page.goto(url)
        await hydrated(page)
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
        expect(overflow, `${url} @ ${width}px`).toBeLessThanOrEqual(0)
        await expect(page.locator('h1')).toHaveCount(1)
      }
      // ошибки загрузки карты OpenStreetMap (сторонний фрейм) не относятся к сайту
      expect(errors.filter((e) => !/openstreetmap|tile/i.test(e))).toEqual([])
    })
  }
})

test('ТК-16. Бургер-меню открывается и закрывается по Esc и по переходу', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'только для телефона')
  await acceptCookies(page)
  await page.goto('/')
  await hydrated(page)
  const burger = page.getByTestId('burger')
  await burger.click()
  const menu = page.locator('#mobile-menu')
  await expect(menu).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(burger).toBeFocused()
  await burger.click()
  await menu.getByRole('link', { name: 'Цены' }).click()
  await expect(page).toHaveURL(/\/prices/)
  await expect(menu).toBeHidden()
})

test('ТК-17. Ссылка «Перейти к содержимому» переводит фокус на main', async ({ page, isMobile }) => {
  test.skip(isMobile, 'клавиатура')
  await acceptCookies(page)
  await page.goto('/')
  await hydrated(page)
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Перейти к содержимому' })
  await expect(skip).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#main$/)
})
