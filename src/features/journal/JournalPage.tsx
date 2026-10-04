import { Link, useSearchParams } from 'react-router';
import { PageHeader } from '../../components/layout/PageHeader';
import { EntryThumb } from '../../components/journal/EntryThumb';
import { EmptyState } from '../../components/ui/EmptyState';
import { Segmented } from '../../components/ui/Segmented';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '../../components/ui/icons';
import { occasionLabel } from '../../config/tags';
import { useEntriesBetween, useJournal } from '../../db/journal';
import type { JournalEntry } from '../../db/types';
import { useBlobUrl } from '../../hooks/useBlobUrl';
import { addMonths, formatDay, formatMonth, monthGrid, monthKey, parseISODate, todayISO } from '../../lib/dates';
import { plural } from '../../lib/format';

type View = 'calendar' | 'list';

/** Journal: a month calendar with each day's outfit (default), or a newest-first feed. */
export function JournalPage() {
  const [params, setParams] = useSearchParams();
  const view: View = params.get('view') === 'list' ? 'list' : 'calendar';
  const today = todayISO();
  const month = /^\d{4}-\d{2}$/.test(params.get('m') ?? '') ? params.get('m')! : monthKey(today);

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) v === null ? next.delete(k) : next.set(k, v);
    setParams(next, { replace: true });
  };

  return (
    <div className="animate-page">
      <PageHeader title="Journal">
        <Segmented
          options={[
            { id: 'calendar', label: 'Calendar' },
            { id: 'list', label: 'List' },
          ]}
          value={view}
          onChange={(v) => update({ view: v === 'list' ? 'list' : null })}
        />
      </PageHeader>
      <div className="mx-auto max-w-3xl px-4 pt-1">
        {view === 'calendar' ? (
          <MonthCalendar month={month} today={today} onMonth={(m) => update({ m: m === monthKey(today) ? null : m })} />
        ) : (
          <Feed />
        )}
      </div>
    </div>
  );
}

function MonthCalendar({ month, today, onMonth }: { month: string; today: string; onMonth: (m: string) => void }) {
  const cells = monthGrid(month);
  const entries = useEntriesBetween(`${month}-01`, `${month}-31`);
  const isCurrent = month === monthKey(today);
  const canGoNext = month < monthKey(today);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => onMonth(addMonths(month, -1))}
          className="tap rounded-full p-2"
          aria-label="Previous month"
        >
          <ChevronLeftIcon />
        </button>
        <div className="text-center">
          <h2 className="font-serif text-xl">{formatMonth(month)}</h2>
          <p className="text-xs text-muted">{entries ? `${plural(entries.size, 'day')} logged` : ' '}</p>
        </div>
        <button
          onClick={() => onMonth(addMonths(month, 1))}
          disabled={!canGoNext}
          className="tap rounded-full p-2 disabled:opacity-25"
          aria-label="Next month"
        >
          <ChevronRightIcon />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] text-muted">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <ol className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <li key={`pad-${i}`} />;
          const entry = entries?.get(day);
          const future = day > today;
          const isToday = day === today;
          return (
            <li key={day}>
              <Link
                to={`/journal/${day}`}
                aria-label={`${formatDay(day)}${entry ? ', logged' : ''}`}
                className={`tap relative block aspect-[3/4] overflow-hidden rounded-lg ${future ? 'pointer-events-none opacity-30' : ''} ${
                  entry ? '' : 'border border-line bg-card/60'
                } ${isToday ? 'ring-2 ring-accent' : ''}`}
              >
                {entry && <EntryThumb entry={entry} className="h-full w-full rounded-lg object-cover" />}
                <span
                  className={`absolute top-0.5 left-1 text-[11px] ${entry ? 'rounded bg-card/80 px-0.5 text-ink' : isToday ? 'font-semibold text-accent' : 'text-muted'}`}
                >
                  {parseISODate(day).getDate()}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      {!isCurrent && (
        <button onClick={() => onMonth(monthKey(today))} className="tap mx-auto mt-4 block text-sm text-accent">
          Back to this month
        </button>
      )}
      <p className="mt-4 text-center text-xs text-muted">Tap any past day to log or edit it.</p>
    </section>
  );
}

function Feed() {
  const entries = useJournal();
  if (entries?.length === 0) {
    return (
      <EmptyState icon={<CalendarIcon size={28} />} title="No outfits logged">
        Tap <strong>Today</strong> in the middle of the tab bar to log your outfit.
      </EmptyState>
    );
  }
  return (
    <ul className="space-y-3 pb-4">
      {entries?.map((e) => (
        <li key={e.id} className="animate-page">
          <FeedCard entry={e} />
        </li>
      ))}
    </ul>
  );
}

/** A day in the list: the mirror photo when there is one, otherwise a mini flat-lay of the pieces. */
function FeedCard({ entry: e }: { entry: JournalEntry }) {
  const photo = useBlobUrl(e.photoThumb ?? e.photo);
  return (
    <Link to={`/journal/${e.date}`} className="tap flex gap-3 rounded-2xl border border-line bg-card p-3">
      {photo ? (
        <img src={photo} alt="Outfit photo" className="aspect-[4/5] w-28 shrink-0 rounded-xl object-cover" />
      ) : (
        <EntryThumb entry={e} className="w-24 shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-serif text-lg">{formatDay(e.date)}</p>
          {e.rating && <span className="shrink-0 text-sm text-accent">{'★'.repeat(e.rating)}</span>}
        </div>
        <p className="text-xs text-muted">
          {[e.occasion && occasionLabel(e.occasion), e.itemIds.length > 0 && plural(e.itemIds.length, 'piece')]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {e.note && <p className="mt-1.5 line-clamp-3 text-sm text-muted">{e.note}</p>}
      </div>
    </Link>
  );
}
