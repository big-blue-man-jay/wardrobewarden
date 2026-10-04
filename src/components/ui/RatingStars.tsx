import type { Rating } from '../../db/types';

const LABELS = ['', 'Not my day', 'Meh', 'Fine', 'Good', 'Loved it'];

/** 1–5 rating; tapping the current value clears it. */
export function RatingStars({ value, onChange }: { value?: Rating; onChange: (v: Rating | undefined) => void }) {
  return (
    <div className="flex items-center gap-1">
      {([1, 2, 3, 4, 5] as Rating[]).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(value === n ? undefined : n)}
          aria-label={`${n} – ${LABELS[n]}`}
          aria-pressed={value === n}
          className={`tap flex h-11 w-11 items-center justify-center text-[28px] leading-none ${value && n <= value ? 'text-accent' : 'text-line'}`}
        >
          ★
        </button>
      ))}
      <span className="ml-2 text-sm text-muted">{value ? LABELS[value] : 'Optional'}</span>
    </div>
  );
}
