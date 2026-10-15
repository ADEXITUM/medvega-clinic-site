/**
 * Маска телефона +7 (___) ___-__-__.
 * Из введённой строки берутся только цифры; первая 7 или 8 считается кодом страны.
 */
export function formatPhone(input: string) {
  let digits = input.replace(/\D/g, '')
  if (digits.startsWith('7') || digits.startsWith('8')) digits = digits.slice(1)
  digits = digits.slice(0, 10)
  if (!digits) return ''
  let out = '+7 (' + digits.slice(0, 3)
  if (digits.length >= 3) out += ') ' + digits.slice(3, 6)
  if (digits.length >= 6) out += '-' + digits.slice(6, 8)
  if (digits.length >= 8) out += '-' + digits.slice(8, 10)
  return out
}

/** Телефон корректен, если набраны все 10 цифр после +7 */
export const isPhoneValid = (value: string) => /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(value)

export const isEmailValid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)

/** ФИО: минимум два слова из букв (кириллица или латиница), допускается дефис */
export const isNameValid = (value: string) => /^[A-Za-zА-Яа-яЁё-]{2,}(\s+[A-Za-zА-Яа-яЁё-]{2,}){1,2}$/.test(value.trim())
