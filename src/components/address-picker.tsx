import { Check, MapPin } from 'lucide-react'

import type { Address } from '../lib/types'

/** radio cards for choosing a delivery address — label on top, full line below */
export function AddressPicker({
  addresses,
  value,
  onChange,
}: {
  addresses: Address[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <div className="addr-list" role="radiogroup" aria-label="Delivery address">
      {addresses.map((a) => {
        const on = a.id === value
        return (
          <button
            key={a.id}
            type="button"
            role="radio"
            aria-checked={on}
            className="addr-option"
            onClick={() => onChange(a.id)}
          >
            <MapPin size={16} strokeWidth={1.75} aria-hidden />
            <span className="row__grow">
              <span className="row__title">
                {a.label}
                {a.isDefault && <span className="addr-option__default">Default</span>}
              </span>
              <span className="row__sub">{a.line}</span>
            </span>
            <span className="addr-option__radio" aria-hidden>
              {on && <Check size={12} strokeWidth={3} />}
            </span>
          </button>
        )
      })}
    </div>
  )
}
