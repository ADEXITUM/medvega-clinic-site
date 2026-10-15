export interface Toast {
  id: number
  text: string
  type: 'success' | 'error' | 'info'
}

let counter = 0

/** Всплывающие уведомления. Контейнер – компонент AppToasts в layout */
export function useToast() {
  const toasts = useState<Toast[]>('toasts', () => [])

  function remove(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function show(text: string, type: Toast['type'] = 'success', timeout = 5000) {
    const id = ++counter
    toasts.value = [...toasts.value, { id, text, type }]
    if (import.meta.client) setTimeout(() => remove(id), timeout)
  }

  return { toasts, show, remove }
}
