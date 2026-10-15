import { expect, test } from '@playwright/test'
import { acceptCookies, hydrated, trackConsole } from './helpers'

test.beforeEach(async ({ page }) => acceptCookies(page))

test('ТК-6. Фильтр врачей по направлению и поиск по ФИО сохраняются в адресе', async ({ page }) => {
  const errors = trackConsole(page)
  await page.goto('/doctors')
  await hydrated(page)
  await expect(page.getByTestId('doctor-card')).toHaveCount(16)

  await page.getByTestId('doctor-direction').selectOption('kardiologiya')
  await expect(page).toHaveURL(/direction=kardiologiya/)
  await expect(page.getByTestId('doctor-card')).toHaveCount(2)

  await page.getByTestId('doctor-search').fill('КУЗНЕЦОВ')
  await expect(page).toHaveURL(/q=/)
  await expect(page.getByTestId('doctor-card')).toHaveCount(1)
  await expect(page.getByTestId('doctor-card')).toContainText('Кузнецов Игорь Павлович')

  // ссылкой на отфильтрованный список можно поделиться
  await page.goto('/doctors?direction=lor')
  await expect(page.getByTestId('doctor-card')).toHaveCount(2)
  await expect(page.getByTestId('doctor-direction')).toHaveValue('lor')
  expect(errors).toEqual([])
})

test('ТК-7. Сортировка врачей по стажу', async ({ page }) => {
  await page.goto('/doctors?sort=exp-desc')
  await expect(page.getByTestId('doctor-card').first()).toContainText('Семёнов Павел Аркадьевич')
})

test('ТК-8. Мгновенный поиск в прайс-листе по названию и коду', async ({ page }) => {
  await page.goto('/prices')
  await hydrated(page)
  await page.getByTestId('price-search').fill('узи')
  await expect(page.getByTestId('price-row').first()).toBeVisible()
  const rows = page.getByTestId('price-row')
  const n = await rows.count()
  expect(n).toBeGreaterThan(5)
  for (let i = 0; i < n; i++) await expect(rows.nth(i)).toContainText(/УЗИ/i)

  await page.getByTestId('price-search').fill('KAR-03')
  await expect(rows).toHaveCount(1)
  await expect(rows.first()).toContainText('ЭКГ с расшифровкой')
  await expect(rows.first()).toContainText('1 100 ₽')

  await page.getByTestId('price-search').fill('несуществующая услуга')
  await expect(page.getByText('Услуги не найдены')).toBeVisible()
})

test('ТК-9. Версия для слабовидящих включается и сохраняется после перезагрузки', async ({ page }) => {
  await page.goto('/')
  await hydrated(page)
  await page.getByTestId('a11y-toggle').click()
  const panel = page.getByTestId('a11y-panel')
  await expect(panel).toBeVisible()
  await panel.getByRole('button', { name: '160 %' }).click()
  await panel.locator('[data-scheme-btn="wb"]').click()
  await panel.getByRole('button', { name: 'Скрыть', exact: true }).click()

  const html = page.locator('html')
  await expect(html).toHaveAttribute('data-font', '160')
  await expect(html).toHaveAttribute('data-scheme', 'wb')

  await page.reload()
  await expect(html).toHaveAttribute('data-a11y', 'on')
  await expect(html).toHaveAttribute('data-font', '160')
  await expect(html).toHaveAttribute('data-scheme', 'wb')
  await expect(html).toHaveAttribute('data-images', 'off')
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  expect(bg).toBe('rgb(0, 0, 0)')

  // при крупном шрифте нет горизонтальной прокрутки
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})

test('ТК-10. Просроченная акция скрыта, действующие показаны', async ({ page }) => {
  await page.goto('/promo')
  await hydrated(page)
  await expect(page.getByTestId('promo-card')).toHaveCount(4)
  await expect(page.getByText('Летний профосмотр')).toHaveCount(0)
})

test('ТК-11. Новый отзыв сохраняется с пометкой «На модерации»', async ({ page }) => {
  await page.goto('/reviews')
  await hydrated(page)
  await page.getByRole('button', { name: 'Оставить отзыв' }).click()
  const form = page.getByTestId('review-form')
  await form.getByRole('button', { name: 'Отправить отзыв' }).click()
  await expect(form.getByText('Укажите, как к вам обращаться')).toBeVisible()

  await form.getByLabel('Ваше имя').fill('Тест')
  await form.getByLabel('Направление').selectOption('uzi')
  await form.getByLabel('Врач').selectOption('nikitina-svetlana')
  await form.getByText('5', { exact: true }).click()
  await form.getByLabel('Отзыв').fill('Очень внимательный врач, всё подробно объяснила.')
  await form.getByTestId('consent').check()
  await form.getByRole('button', { name: 'Отправить отзыв' }).click()
  await expect(page.getByTestId('review-card').first()).toContainText('На модерации')
  await page.reload()
  await expect(page.getByTestId('review-card').first()).toContainText('На модерации')
})

test('ТК-12. Обратный звонок: проверка полей и отправка', async ({ page }) => {
  await page.goto('/contacts')
  await hydrated(page)
  await page.getByTestId('callback-open').click()
  const dialog = page.getByRole('dialog', { name: 'Обратный звонок' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'Жду звонка' }).click()
  await expect(dialog.getByText('Укажите имя')).toBeVisible()
  await dialog.getByLabel('Имя').fill('Анна')
  await dialog.getByLabel('Телефон').pressSequentially('9145556677')
  await dialog.getByTestId('consent').check()
  await dialog.getByRole('button', { name: 'Жду звонка' }).click()
  await expect(dialog).toBeHidden({ timeout: 5000 })
  await expect(page.getByRole('status')).toContainText('Спасибо, Анна')
})

test('ТК-13. Cookie-баннер показывается один раз', async ({ browser }) => {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.goto('http://localhost:4173/')
  await hydrated(page)
  await expect(page.getByTestId('cookie-banner')).toBeVisible()
  await page.getByRole('button', { name: 'Понятно' }).click()
  await expect(page.getByTestId('cookie-banner')).toBeHidden()
  await page.reload()
  await hydrated(page)
  await expect(page.getByTestId('cookie-banner')).toHaveCount(0)
  await ctx.close()
})

test('ТК-18. Поиск по сайту находит врачей и услуги', async ({ page }) => {
  await page.goto('/search')
  await hydrated(page)
  await page.getByTestId('site-search').fill('кардио')
  await expect(page.getByRole('link', { name: 'Кардиология' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Смирнова Елена Викторовна' })).toBeVisible()
  await expect(page).toHaveURL(/q=/)
})

test('ТК-14. Несуществующий адрес показывает страницу 404 со ссылками', async ({ page }) => {
  await page.goto('/no-such-page')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Страница не найдена')
  await expect(page.getByRole('link', { name: 'Записаться к врачу' })).toBeVisible()
})
