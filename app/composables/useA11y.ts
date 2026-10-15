/**
 * Версия для слабовидящих. Настройки хранятся в localStorage и применяются атрибутами data-* на <html>.
 * Чтобы при перезагрузке не было «вспышки» обычной версии, те же атрибуты заранее выставляет
 * встроенный скрипт в <head> (см. A11Y_BOOT_SCRIPT, подключается в app.vue).
 */
export type FontScale = '100' | '130' | '160'
export type Scheme = 'default' | 'bw' | 'wb' | 'blue'

export interface A11ySettings {
  enabled: boolean
  font: FontScale
  scheme: Scheme
  images: 'on' | 'off'
  spacing: 'normal' | 'wide'
}

export const A11Y_KEY = 'medvega:a11y'

const DEFAULTS: A11ySettings = { enabled: false, font: '100', scheme: 'default', images: 'on', spacing: 'normal' }

export const A11Y_BOOT_SCRIPT = `try{var s=JSON.parse(localStorage.getItem('${A11Y_KEY}')||'null');if(s&&s.enabled){var h=document.documentElement;h.dataset.font=s.font;h.dataset.scheme=s.scheme;h.dataset.images=s.images;h.dataset.spacing=s.spacing;h.dataset.a11y='on'}}catch(e){}`

function apply(s: A11ySettings) {
  const h = document.documentElement
  if (s.enabled) {
    h.dataset.a11y = 'on'
    h.dataset.font = s.font
    h.dataset.scheme = s.scheme
    h.dataset.images = s.images
    h.dataset.spacing = s.spacing
  } else {
    for (const k of ['a11y', 'font', 'scheme', 'images', 'spacing']) h.removeAttribute(`data-${k}`)
  }
}

export function useA11y() {
  const settings = useState<A11ySettings>('a11y', () => ({ ...DEFAULTS }))
  const panelOpen = useState('a11y-panel', () => false)

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(A11Y_KEY) || 'null')
      if (saved) settings.value = { ...DEFAULTS, ...saved }
    } catch {
      /* повреждённые данные игнорируются */
    }
    apply(settings.value)
  }

  function save() {
    apply(settings.value)
    try {
      localStorage.setItem(A11Y_KEY, JSON.stringify(settings.value))
    } catch {
      /* без сохранения */
    }
  }

  function update(patch: Partial<A11ySettings>) {
    settings.value = { ...settings.value, ...patch }
    save()
  }

  function toggle() {
    update({ enabled: !settings.value.enabled })
    panelOpen.value = settings.value.enabled
  }

  function reset() {
    settings.value = { ...DEFAULTS }
    panelOpen.value = false
    save()
  }

  return { settings, panelOpen, load, update, toggle, reset }
}
