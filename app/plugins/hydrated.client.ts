// Отмечает завершение гидратации атрибутом data-hydrated на <html> (используется e2e-тестами и скриптом скриншотов)
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:suspense:resolve', () => {
    document.documentElement.dataset.hydrated = 'true'
  })
})
