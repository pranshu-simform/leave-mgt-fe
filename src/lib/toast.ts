import { toast } from 'sonner'

// An id makes a repeated message replace itself instead of stacking.
export function showSuccess(message: string, id?: string): void {
  toast.success(message, { id })
}

export function showError(message: string, id?: string): void {
  toast.error(message, { id })
}

export function showInfo(message: string, id?: string): void {
  toast.info(message, { id })
}
