import { Link } from 'react-router';
import type { ReactNode } from 'react';
import { Swatch } from '../../components/ui/Chip';
import { getColor } from '../../config/tags';
import type { Item } from '../../db/types';
import { monthName, parseISODate } from '../../lib/dates';

/** A KPI tile: one headline number in plain sans, label underneath. */
export function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-card px-3 py-3">
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-xs text-muted">{label}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted/80">{hint}</p>}
    </div>
  );
}

export function InsightCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-line bg-card p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl leading-tight">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Horizontal bar rows: label · thin single-color bar · value. Doubles as the table view. */
export function BarRows({ rows }: { rows: { key: string; label: ReactNode; value: number; display?: string }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.key} className="grid grid-cols-[7.5rem_1fr_2.25rem] items-center gap-3 text-sm">
          <span className="flex min-w-0 items-center gap-2 truncate">{r.label}</span>
          <span className="h-2 rounded-full bg-tile" aria-hidden="true">
            <span className="block h-full rounded-full bg-accent" style={{ width: `${(r.value / max) * 100}%` }} />
          </span>
          <span className="text-right text-muted tabular-nums">{r.display ?? r.value}</span>
        </li>
      ))}
    </ul>
  );
}

export function ColorLabel({ id }: { id: string }) {
  const c = getColor(id);
  return (
    <>
      {c && <Swatch color={c} size={14} />}
      <span className="truncate">{c?.label.replace(' / pattern', '') ?? id}</span>
    </>
  );
}

/** The wardrobe's color palette: one square per piece, in its main color, grouped in palette order. */
export function PaletteGrid({ items }: { items: Item[] }) {
  return (
    <ul className="grid gap-[2px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(34px, 1fr))' }}>
      {items.map((item) => {
        const c = item.colors[0] ? getColor(item.colors[0]) : undefined;
        const style = !c
          ? { background: 'repeating-linear-gradient(45deg, #e5dfd5 0 4px, #f6f3ee 4px 8px)' }
          : c.pattern
            ? { background: 'conic-gradient(from 45deg, #c0332b, #e8c547, #3d7d4f, #2f62b0, #6f4a8e, #c0332b)' }
            : { background: c.hex };
        return (
          <li key={item.id}>
            <Link
              to={`/closet/${item.id}`}
              title={`${item.name} (${c?.label ?? 'no color'})`}
              aria-label={`${item.name}, ${c?.label ?? 'no color'}`}
              className="tap block aspect-square rounded-[4px] ring-1 ring-ink/10 ring-inset"
              style={style}
            />
          </li>
        );
      })}
    </ul>
  );
}

/** Days logged per month as columns; the current month is highlighted, earlier months muted. */
export function MonthColumns({
  months,
}: {
  months: { month: string; count: number; days: number; current: boolean }[];
}) {
  const max = 31;
  return (
    <div>
      <div className="flex h-28 items-end gap-2 border-b border-line">
        {months.map((m) => (
          <div key={m.month} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span className={`text-xs tabular-nums ${m.current ? 'font-semibold text-ink' : 'text-muted'}`}>
              {m.count}
            </span>
            <span
              className={`w-full max-w-9 rounded-t-[4px] ${m.current ? 'bg-accent' : 'bg-ink/20'}`}
              style={{ height: `${(m.count / max) * 100}%`, minHeight: m.count ? 4 : 0 }}
              title={`${m.count} of ${m.days} days`}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-2">
        {months.map((m) => (
          <span
            key={m.month}
            className={`flex-1 text-center text-xs ${m.current ? 'font-medium text-ink' : 'text-muted'}`}
          >
            {monthName(parseISODate(`${m.month}-01`).getMonth()).slice(0, 3)}
          </span>
        ))}
      </div>
    </div>
  );
}
