import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Bath,
  Bone,
  Check,
  Inbox,
  Cookie,
  HeartPulse,
  Pill as PillIcon,
  Scissors,
  Stethoscope,
  Syringe,
  ToyBrick,
  X,
} from 'lucide-react'

import type { ProductCategory, ServiceType, Species } from '../lib/types'
import { money } from '../lib/format'

/* ------------------------------------------------------------ icon system */

const CATEGORY_ICONS: Record<ProductCategory, typeof Bone> = {
  food: Bone,
  treats: Cookie,
  grooming: Bath,
  toys: ToyBrick,
  health: PillIcon,
}

const SERVICE_ICONS: Record<ServiceType, typeof Bone> = {
  consultation: Stethoscope,
  vaccination: Syringe,
  grooming: Scissors,
  dental: PillIcon,
  surgery: HeartPulse,
  checkup: Stethoscope,
}

export function CategoryIcon({ category, size = 22 }: { category: ProductCategory; size?: number }) {
  const Icon = CATEGORY_ICONS[category]
  return <Icon size={size} strokeWidth={1.75} aria-hidden />
}

/** per-category tint class — the tint encodes the category, it is not decoration */
export function tileClass(category: ProductCategory): string {
  return `tile--${category}`
}

export function ServiceIcon({ type, size = 18 }: { type: ServiceType; size?: number }) {
  const Icon = SERVICE_ICONS[type]
  return <Icon size={size} strokeWidth={1.75} aria-hidden />
}

export function PetGlyph({ species, size = 18 }: { species: Species; size?: number }) {
  if (species === 'bird') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M16 7h.01" />
        <path d="M3.5 20 11 13" />
        <path d="M11 13c-1.6-4.6.4-9 5-9 2.2 0 3.6 1.3 4 3l1.5.5L20 9c0 5-3.6 9-9 9H7" />
        <path d="M11 13c2 .3 4-.3 5.5-2" />
      </svg>
    )
  }
  return species === 'cat' ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 9.5 4.5 4l4 3h7l4-3 .5 5.5" />
      <path d="M4.5 9.5C3.6 10.6 3 12 3 13.8 3 18.4 7 21 12 21s9-2.6 9-7.2c0-1.8-.6-3.2-1.5-4.3" />
      <path d="M8.5 14.5h.01M15.5 14.5h.01" />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5.5 11 3 6.5 6.5 8M18.5 11 21 6.5 17.5 8" />
      <path d="M5.5 11c-1 1.3-1.5 2.6-1.5 4.2C4 18.9 7.6 21 12 21s8-2.1 8-5.8c0-1.6-.5-2.9-1.5-4.2" />
      <path d="M5.5 11C6.6 9.6 8.9 8.8 12 8.8s5.4.8 6.5 2.2" />
      <path d="M9 15h.01M15 15h.01M12.5 17c-.8.6-2.2.6-3 0" />
    </svg>
  )
}

/* ---------------------------------------------------------------- pieces */

export function Stars({ rating }: { rating: number }) {
  return (
    <span className="rating">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2.5 14.9 8.6 21.5 9.5 16.7 14.1 17.9 20.7 12 17.5 6.1 20.7 7.3 14.1 2.5 9.5 9.1 8.6Z" />
      </svg>
      {rating.toFixed(1)}
    </span>
  )
}

/** price with the cents set smaller — reads faster than uniform mono money */
export function Price({ value, className = '' }: { value: number; className?: string }) {
  const formatted = money(value)
  const dot = formatted.lastIndexOf('.')
  const whole = dot === -1 ? formatted : formatted.slice(0, dot)
  const cents = dot === -1 ? '' : formatted.slice(dot)
  return (
    <span className={`price ${className}`.trim()}>
      {whole}
      {cents && <span className="price__cents">{cents}</span>}
    </span>
  )
}

export function Pill({ tone, children }: { tone: 'ok' | 'warn' | 'bad' | 'info'; children: React.ReactNode }) {
  return <span className={`pill pill--${tone}`}>{children}</span>
}

export function orderStatusTone(status: string): 'ok' | 'warn' | 'bad' | 'info' {
  if (status === 'delivered') return 'ok'
  if (status === 'transit') return 'info'
  return 'warn'
}

export function OrderStatusLabel({ status }: { status: string }) {
  const label =
    status === 'delivered' ? 'Delivered' : status === 'transit' ? 'In transit' : 'Placed'
  return (
    <Pill tone={orderStatusTone(status)}>
      {status === 'transit' ? '→ ' : ''}
      {label}
    </Pill>
  )
}

/**
 * An empty list is a moment, not a hole: say what will live here, then give
 * one clear way forward (plus an optional second). `children` holds extras
 * such as suggestion chips. `level` sets the heading so it nests correctly
 * under the section it sits in.
 */
export function EmptyState({
  title,
  text,
  icon,
  actionLabel,
  actionTo,
  actionSearch,
  onClick,
  secondaryLabel,
  secondaryTo,
  secondarySearch,
  onSecondary,
  level = 2,
  compact = false,
  children,
}: {
  title: string
  text: string
  icon?: React.ReactNode
  actionLabel?: string
  actionTo?: string
  actionSearch?: Record<string, string>
  onClick?: () => void
  secondaryLabel?: string
  secondaryTo?: string
  secondarySearch?: Record<string, string>
  onSecondary?: () => void
  level?: 2 | 3
  compact?: boolean
  children?: React.ReactNode
}) {
  const Heading = level === 3 ? 'h3' : 'h2'
  const primary =
    actionLabel && actionTo ? (
      <Link to={actionTo} search={actionSearch as never} className="btn btn--primary">
        {actionLabel}
      </Link>
    ) : actionLabel && onClick ? (
      <button type="button" className="btn btn--primary" onClick={onClick}>
        {actionLabel}
      </button>
    ) : null
  const secondary =
    secondaryLabel && secondaryTo ? (
      <Link to={secondaryTo} search={secondarySearch as never} className="btn btn--ghost">
        {secondaryLabel}
      </Link>
    ) : secondaryLabel && onSecondary ? (
      <button type="button" className="btn btn--ghost" onClick={onSecondary}>
        {secondaryLabel}
      </button>
    ) : null
  return (
    <div className={`empty${compact ? ' empty--compact' : ''}`}>
      <span className="empty__icon" aria-hidden>
        {icon ?? <Inbox size={22} strokeWidth={1.75} />}
      </span>
      <Heading className="empty__title">{title}</Heading>
      <p className="empty__text">{text}</p>
      {(primary || secondary) && (
        <div className="empty__actions">
          {primary}
          {secondary}
        </div>
      )}
      {children && <div className="empty__extra">{children}</div>}
    </div>
  )
}

export function Stepper({
  value,
  onChange,
  min = 1,
  max = 99,
  label,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  label: string
}) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button
        type="button"
        className="stepper__btn"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
      >
        −
      </button>
      <span className="stepper__val" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="stepper__btn"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
      >
        +
      </button>
    </div>
  )
}

/* ----------------------------------------------------------------- sheet */

export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  className,
  hideHead,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
  hideHead?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const [tall, setTall] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) {
      setTall(false)
      el.showModal()
    }
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={`sheet${tall ? ' sheet--tall' : ''}${className ? ` ${className}` : ''}`}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
    >
      <button
        type="button"
        className="sheet__handle-btn"
        onClick={() => setTall((t) => !t)}
        aria-expanded={tall}
        aria-label={tall ? 'Shrink sheet' : 'Expand sheet to full height'}
      >
        <span className="sheet__handle" aria-hidden />
      </button>
      {!hideHead && (
        <div className="sheet__head">
          <h2 className="sheet__title">{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>
      )}
      {children}
      {footer && <div style={{ marginTop: 'var(--space-md)' }}>{footer}</div>}
    </dialog>
  )
}

/* ----------------------------------------------------------------- field */

export function Field({
  label,
  help,
  error,
  children,
}: {
  label: string
  help?: string
  error?: string
  children: React.ReactNode
}) {
  const id = useRef(`f-${label.replace(/\s+/g, '-').toLowerCase()}`).current
  const helpId = `${id}-help`
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {children /* inputs receive id + aria-describedby by caller contract */}
      <p
        id={helpId}
        className={`field__help${error ? ' field__help--error' : ''}`}
        role={error ? 'alert' : undefined}
      >
        {error ?? help ?? ''}
      </p>
      <style>{``}</style>
    </div>
  )
}

/** input wired to Field's help id — keeps label/help/error association without prop drilling */
export function FieldInput({
  fieldLabel,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { fieldLabel: string }) {
  const id = `f-${fieldLabel.replace(/\s+/g, '-').toLowerCase()}`
  return <input id={id} aria-describedby={`${id}-help`} className="input" {...props} />
}

/* --------------------------------------------------- copy-style feedback */

export function useCopiedLabel(activeMs = 1500) {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const t = window.setTimeout(() => setCopied(false), activeMs)
    return () => window.clearTimeout(t)
  }, [copied, activeMs])
  return [copied, () => setCopied(true)] as const
}

export function CopiedCheck({ copied }: { copied: boolean }) {
  return copied ? (
    <Check size={14} strokeWidth={2.25} aria-hidden />
  ) : null
}
