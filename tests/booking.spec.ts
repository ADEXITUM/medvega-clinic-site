import { expect, test } from '@playwright/test'
import { acceptCookies, trackConsole, walkToForm } from './helpers'

test.beforeEach(async ({ page }) => acceptCookies(page))

test('ТК-1. Полная онлайн-запись от выбора направления до экрана «Вы записаны»', async ({ page }) => {
  const errors = trackConsole(page)
  const { time } = await walkToForm(page)

  await page.getByLabel('Фамилия, имя, отчество').fill('Петров Пётр Петрович')
  await page.getByLabel('Телефон').pressSequentially('9241234567')
  await expect(page.getByLabel('Телефон')).toHaveValue('+7 (924) 123-45-67')
  await page.getByTestId('consent').check()
  await page.getByTestId('booking-submit').click()

  const done = page.getByTestId('booking-done')
  await expect(done).toBeVisible({ timeout: 5000 })
  await expect(done.getByRole('heading', { level: 1 })).toHaveText('Вы записаны!')
  await expect(done).toContainText('Иванова Анна Сергеевна')
  await expect(done).toContainText(time)
  expect(errors).toEqual([])
})

test('ТК-2. Запись появляется в «Мои записи», отменяется, слот снова свободен', async ({ page }) => {
  const { date, time } = await walkToForm(page)
  await page.getByLabel('Фамилия, имя, отчество').fill('Сидорова Мария')
  await page.getByLabel('Телефон').pressSequentially('9001112233')
  await page.getByTestId('consent').check()
  await page.getByTestId('booking-submit').click()
  await expect(page.getByTestId('booking-done')).toBeVisible({ timeout: 5000 })

  // занятый слот на этом устройстве недоступен
  await page.goto(`/booking?direction=terapiya&doctor=ivanova-anna&date=${date}`)
  await expect(page.locator(`[data-testid="slots"] button[data-time="${time}"]`)).toBeDisabled()

  await page.goto('/my')
  const card = page.getByTestId('my-booking')
  await expect(card).toHaveCount(1)
  await expect(card).toContainText(time)
  await card.getByTestId('cancel-booking').click()
  await page.getByTestId('confirm-cancel').click()
  await expect(page.getByTestId('my-booking')).toHaveCount(0)
  await expect(page.getByTestId('my-past')).toContainText('Отменена')

  await page.goto(`/booking?direction=terapiya&doctor=ivanova-anna&date=${date}`)
  await expect(page.locator(`[data-testid="slots"] button[data-time="${time}"]`)).toBeEnabled()
})

test('ТК-3. Форму нельзя отправить без согласия на обработку персональных данных', async ({ page }) => {
  await walkToForm(page)
  await page.getByLabel('Фамилия, имя, отчество').fill('Петров Пётр Петрович')
  await page.getByLabel('Телефон').pressSequentially('9241234567')
  await page.getByTestId('booking-submit').click()

  await expect(page.getByText('Без согласия на обработку персональных данных записаться нельзя')).toBeVisible()
  await expect(page.getByTestId('consent')).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByTestId('booking-done')).toHaveCount(0)
})

test('ТК-4. Форму нельзя отправить с неполным телефоном; ошибка связана с полем', async ({ page }) => {
  await walkToForm(page)
  await page.getByLabel('Фамилия, имя, отчество').fill('Петров Пётр Петрович')
  const phone = page.getByLabel('Телефон')
  await phone.pressSequentially('92412')
  await page.getByTestId('consent').check()
  await page.getByTestId('booking-submit').click()

  const msg = page.getByText('Введите телефон полностью в формате +7 (999) 123-45-67')
  await expect(msg).toBeVisible()
  await expect(phone).toHaveAttribute('aria-invalid', 'true')
  const errId = await msg.locator('xpath=..').getAttribute('id')
  await expect(phone).toHaveAttribute('aria-describedby', new RegExp(errId!))
  await expect(page.getByTestId('booking-done')).toHaveCount(0)
})

test('ТК-23. Перенос записи: новая запись создана, прежняя отменена', async ({ page }) => {
  await walkToForm(page)
  await page.getByLabel('Фамилия, имя, отчество').fill('Петров Пётр Петрович')
  await page.getByLabel('Телефон').pressSequentially('9241234567')
  await page.getByTestId('consent').check()
  await page.getByTestId('booking-submit').click()
  await expect(page.getByTestId('booking-done')).toBeVisible({ timeout: 5000 })

  await page.goto('/my')
  await page.getByTestId('reschedule-booking').click()
  await expect(page.getByTestId('reschedule-note')).toBeVisible()
  await expect(page.getByTestId('booking-step')).toHaveAttribute('data-step', '3')
  await page.locator('[data-testid="calendar"] button:not([disabled])').last().click()
  await page.locator('[data-testid="slots"] button:not([disabled])').last().click()
  await page.getByLabel('Фамилия, имя, отчество').fill('Петров Пётр Петрович')
  await page.getByLabel('Телефон').pressSequentially('9241234567')
  await page.getByTestId('consent').check()
  await page.getByTestId('booking-submit').click()
  await expect(page.getByTestId('booking-done')).toContainText('прежняя запись отменена', { timeout: 5000 })

  await page.goto('/my')
  await expect(page.getByTestId('my-booking')).toHaveCount(1)
  await expect(page.getByTestId('my-past')).toContainText('Отменена')
})

test('ТК-24. Черновик записи сохраняется после перезагрузки страницы', async ({ page }) => {
  await walkToForm(page)
  await page.getByLabel('Фамилия, имя, отчество').fill('Сидорова Мария')
  await page.reload()
  await expect(page.getByTestId('booking-step')).toHaveAttribute('data-step', '5')
  await expect(page.getByLabel('Фамилия, имя, отчество')).toHaveValue('Сидорова Мария')
  await expect(page.getByTestId('consent')).not.toBeChecked()
})

test('ТК-25. Запись можно добавить в календарь (файл .ics)', async ({ page }) => {
  await walkToForm(page)
  await page.getByLabel('Фамилия, имя, отчество').fill('Петров Пётр Петрович')
  await page.getByLabel('Телефон').pressSequentially('9241234567')
  await page.getByTestId('consent').check()
  await page.getByTestId('booking-submit').click()
  await expect(page.getByTestId('booking-done')).toBeVisible({ timeout: 5000 })
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByTestId('add-calendar').click()])
  expect(download.suggestedFilename()).toMatch(/\.ics$/)
})

test('ТК-5. Кнопка «Записаться» на странице врача открывает мастер с выбранными шагами', async ({ page }) => {
  await page.goto('/doctors/smirnova-elena')
  await page.getByTestId('doctor-book').click()
  await expect(page).toHaveURL(/direction=kardiologiya&doctor=smirnova-elena/)
  await expect(page.getByTestId('booking-step')).toHaveAttribute('data-step', '3')
  await expect(page.getByTestId('calendar')).toBeVisible()
})
