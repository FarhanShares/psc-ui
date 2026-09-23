import { BOOKING_SLOTS, slotAvailable } from '../lib/data'
import { dateFromOffset, isoDay, longDate } from '../lib/format'

export const BOOKING_WINDOW_DAYS = 7

/** today + the next six days, as offsets */
export const DAY_OFFSETS = Array.from({ length: BOOKING_WINDOW_DAYS }, (_, i) => i)

/**
 * Day strip (seven equal columns — never scrolls) plus a time-slot grid.
 * Availability is deterministic per clinic + day, so SSR and client agree.
 */
export function SlotPicker({
  clinicId,
  dayOffset,
  onDay,
  slot,
  onSlot,
  startOffset = 0,
}: {
  clinicId: string
  dayOffset: number
  onDay: (offset: number) => void
  slot: string | null
  onSlot: (slot: string) => void
  startOffset?: number
}) {
  const offsets = DAY_OFFSETS.map((d) => d + startOffset)
  const dayIso = isoDay(dateFromOffset(dayOffset))
  const open = BOOKING_SLOTS.filter((s) => slotAvailable(clinicId, dayIso, s)).length

  return (
    <div className="stack">
      <fieldset className="plain-fieldset">
        <legend className="tag">Day</legend>
        <div className="day-grid" role="radiogroup" aria-label="Day">
          {offsets.map((off) => {
            const d = dateFromOffset(off)
            return (
              <button
                key={off}
                type="button"
                role="radio"
                aria-checked={dayOffset === off}
                aria-label={longDate(d)}
                className="day-cell"
                onClick={() => onDay(off)}
              >
                <span className="day-cell__dow">
                  {off === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className="day-cell__num num">{d.getDate()}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <fieldset className="plain-fieldset">
        <legend className="tag">
          {longDate(dateFromOffset(dayOffset))} · <span className="num">{open}</span> open
        </legend>
        <div className="slots" role="group" aria-label="Time slots">
          {BOOKING_SLOTS.map((s) => {
            const available = slotAvailable(clinicId, dayIso, s)
            return (
              <button
                key={s}
                type="button"
                className="slot"
                aria-pressed={slot === s}
                disabled={!available}
                aria-label={available ? s : `${s}, taken`}
                onClick={() => onSlot(s)}
              >
                {s}
              </button>
            )
          })}
        </div>
      </fieldset>
    </div>
  )
}
