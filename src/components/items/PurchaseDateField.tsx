import { monthName } from '../../lib/dates';
import { Chip, FieldLabel } from '../ui/Chip';

const select =
  'min-h-11 rounded-xl border border-line bg-card px-3 text-base outline-none focus:border-ink disabled:opacity-40';

/**
 * Purchase date that can be as precise as I remember: just a year, month + year, or an exact day.
 * Stored as 'YYYY', 'YYYY-MM' or 'YYYY-MM-DD'; undefined = don't remember.
 */
export function PurchaseDateField({ value, onChange }: { value?: string; onChange: (v: string | undefined) => void }) {
  const [y, m, d] = value ? value.split('-') : [];
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: thisYear - 1969 }, (_, i) => String(thisYear - i));
  const daysInMonth = y && m ? new Date(Number(y), Number(m), 0).getDate() : 31;

  const set = (year?: string, month?: string, day?: string) => {
    if (!year) return onChange(undefined);
    if (!month) return onChange(year);
    // Drop a day that doesn't exist in the newly picked month (e.g. 31 → February).
    if (!day || Number(day) > new Date(Number(year), Number(month), 0).getDate()) return onChange(`${year}-${month}`);
    onChange(`${year}-${month}-${day}`);
  };

  return (
    <section>
      <FieldLabel hint="Year alone is fine">When I bought it</FieldLabel>
      <div className="grid grid-cols-[1.1fr_1.3fr_0.9fr] gap-2">
        <select aria-label="Year" className={select} value={y ?? ''} onChange={(e) => set(e.target.value || undefined, m, d)}>
          <option value="">Year</option>
          {years.map((yr) => (
            <option key={yr}>{yr}</option>
          ))}
        </select>
        <select
          aria-label="Month"
          className={select}
          disabled={!y}
          value={m ?? ''}
          onChange={(e) => set(y, e.target.value || undefined, d)}
        >
          <option value="">Month</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={String(i + 1).padStart(2, '0')}>
              {monthName(i)}
            </option>
          ))}
        </select>
        <select
          aria-label="Day"
          className={select}
          disabled={!m}
          value={d ?? ''}
          onChange={(e) => set(y, m, e.target.value || undefined)}
        >
          <option value="">Day</option>
          {Array.from({ length: daysInMonth }, (_, i) => (
            <option key={i} value={String(i + 1).padStart(2, '0')}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-2">
        <Chip selected={!value} onClick={() => onChange(undefined)}>
          Don't remember
        </Chip>
      </div>
    </section>
  );
}
