import { useEffect, useRef, type ReactNode } from 'react'
import { X, CalendarDays, type LucideIcon } from 'lucide-react'

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}
export function Empty({
  title,
  description,
  action,
  icon: Icon = CalendarDays,
}: {
  title: string
  description: string
  action?: ReactNode
  icon?: LucideIcon
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon size={26} strokeWidth={1.5} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  )
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: ReactNode
  onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="modal-title"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal-head">
        <h2 id="modal-title">{title}</h2>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Fechar"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  )
}
export function Feedback({
  message,
  success = false,
}: {
  message: string
  success?: boolean
}) {
  return message ? (
    <p
      role={success ? 'status' : 'alert'}
      className={`feedback ${success ? 'success' : ''}`}
    >
      {message}
    </p>
  ) : null
}
export function Status({ value }: { value: string }) {
  const labels: Record<string, string> = {
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    requested: 'Solicitado',
    scheduled: 'Agendado',
    completed: 'Realizado',
  }
  return <span className={`status ${value}`}>{labels[value] || value}</span>
}
