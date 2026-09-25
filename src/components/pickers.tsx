import { useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Check, Search } from 'lucide-react'

import { Sheet } from './ui'

/* pages pick their own split point; both use 48rem */
const WIDE = '(min-width: 48rem)'

export interface PickerOption {
  id: string
  label: string
  hint?: string
}

function OptionRows({
  value,
  options,
  onChange,
  title,
}: {
  value: string
  options: PickerOption[]
  onChange: (id: string) => void
  title: string
}) {
  return (
    <div role="radiogroup" aria-label={title} className="option-list">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={o.id === value}
          className={`option-row${o.id === value ? ' is-selected' : ''}`}
          onClick={() => onChange(o.id)}
        >
          <span className="option-row__label">{o.label}</span>
          {o.hint && <span className="option-row__hint">{o.hint}</span>}
          {o.id === value && <Check size={15} strokeWidth={2.25} aria-hidden />}
        </button>
      ))}
    </div>
  )
}

/**
 * A compact picker: icon button on wide screens (Popover API dropdown),
 * bottom sheet with a radio list on phones. Same state drives both.
 */
export function OptionPicker({
  icon: Icon,
  title,
  value,
  options,
  onChange,
  variant = 'icon',
  prefix = '',
  align = 'auto',
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
  title: string
  value: string
  options: PickerOption[]
  onChange: (id: string) => void
  variant?: 'icon' | 'labeled'
  prefix?: string
  /** dropdown edge to line up with the button; auto = end when the button is on the right */
  align?: 'start' | 'end' | 'auto'
}) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const popRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const current = options.find((o) => o.id === value)

  function openPicker() {
    const pop = popRef.current
    if (window.matchMedia(WIDE).matches && pop && typeof pop.showPopover === 'function') {
      const r = btnRef.current?.getBoundingClientRect()
      try {
        pop.showPopover()
      } catch {
        setSheetOpen(true)
        return
      }
      if (r) {
        // measure after opening; a control on the right half opens leftwards so
        // the menu's right edge lines up with the button's right edge
        const w = pop.offsetWidth
        const alignEnd = align === 'end' || (align === 'auto' && r.left + r.width / 2 > window.innerWidth / 2)
        const left = alignEnd ? r.right - w : r.left
        pop.style.top = `${Math.round(r.bottom + 6)}px`
        pop.style.left = `${Math.round(Math.max(8, Math.min(left, window.innerWidth - w - 8)))}px`
      }
      return
    }
    setSheetOpen(true)
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={`picker-btn${variant === 'labeled' ? ' picker-btn--labeled' : ''}`}
        onClick={openPicker}
        aria-haspopup="menu"
        aria-label={variant === 'icon' ? `${title}: ${current?.label ?? ''}` : title}
      >
        <Icon size={variant === 'icon' ? 17 : 15} strokeWidth={1.75} aria-hidden />
        {variant === 'labeled' && (
          <span className="picker-btn__label">
            {prefix ? `${prefix} · ` : ''}
            {current?.label}
          </span>
        )}
      </button>

      <div ref={popRef} popover="auto" className="dropdown">
        <OptionRows
          value={value}
          options={options}
          title={title}
          onChange={(id) => {
            onChange(id)
            popRef.current?.hidePopover()
          }}
        />
      </div>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={title}>
        <OptionRows
          value={value}
          options={options}
          title={title}
          onChange={(id) => {
            onChange(id)
            setSheetOpen(false)
          }}
        />
      </Sheet>
    </>
  )
}

/**
 * Search: a real inline input on wide screens; on phones a large
 * trigger that opens a full-screen sheet with the keyboard-ready input
 * and live results.
 */
export function SearchControl({
  placeholder,
  value,
  onChange,
  children,
}: {
  placeholder: string
  value: string
  onChange: (v: string) => void
  children: React.ReactNode | ((close: () => void) => React.ReactNode)
}) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <div className="search search--inline">
        <Search size={16} strokeWidth={1.75} aria-hidden />
        <input
          type="search"
          className="input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={placeholder}
        />
      </div>

      <button type="button" className="search-trigger" onClick={() => setOpen(true)} aria-label={`Open search: ${placeholder}`}>
        <Search size={16} strokeWidth={1.75} aria-hidden />
        <span className={value ? 'search-trigger__value' : undefined}>{value || placeholder}</span>
      </button>

      <Sheet className="sheet--search" open={open} onClose={close} title={placeholder} hideHead>
        <div className="search-sheet__bar">
          <div className="search">
            <Search size={16} strokeWidth={1.75} aria-hidden />
            <input
              type="search"
              className="input"
              placeholder={placeholder}
              value={value}
              data-autofocus
              onChange={(e) => onChange(e.target.value)}
              aria-label={placeholder}
            />
          </div>
          <button type="button" className="btn btn--quiet" onClick={close}>
            Cancel
          </button>
        </div>
        <div className="search-sheet__results">
          {typeof children === 'function' ? children(close) : children}
        </div>
      </Sheet>
    </>
  )
}

/** one row inside the mobile search sheet */
export function ResultRow({
  to,
  params,
  tile,
  title,
  meta,
  onClose,
  search,
}: {
  to: '/shop/$id' | '/clinics/$id'
  params: { id: string }
  search?: Record<string, string>
  tile: React.ReactNode
  title: string
  meta: string
  onClose: () => void
}) {
  return (
    <Link to={to} params={params} search={search as never} onClick={onClose} className="card card--press row">
      {tile}
      <span className="row__grow" style={{ minWidth: 0 }}>
        <span className="row__title">{title}</span>
        <span className="row__sub">{meta}</span>
      </span>
      <span aria-hidden style={{ color: 'var(--color-muted)' }}>›</span>
    </Link>
  )
}
