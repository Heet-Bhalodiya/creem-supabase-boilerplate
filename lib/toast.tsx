import { toast as sonnerToast } from 'sonner'
import type { ToastT } from 'sonner'

export const toast = (type: ToastT['type'], message: string) => {
  // @ts-expect-error - Sonner's types are a bit off
  sonnerToast[type](message, {
    duration: 3000,
    closeButton: true
  })
}
