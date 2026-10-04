import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router';
import { GearIcon } from '../../components/ui/icons';
import { db } from '../../db/db';
import { useEntry } from '../../db/journal';
import { loggingStreak, monthName, parseISODate, todayISO, weekdayLong } from '../../lib/dates';
import { ForgottenNudge } from './ForgottenNudge';
import { TodayOutfit } from './TodayOutfit';
import { WeekStrip } from './WeekStrip';

/** Landing screen: today's date and outfit, this week at a glance, and a gentle nudge. */
export function TodayPage() {
  const today = todayISO();
  const entry = useEntry(today);
  const d = parseISODate(today);
  const streak = useLiveQuery(async () => {
    const dates = await db.journal.orderBy('date').keys();
    return loggingStreak(new Set(dates as string[]), today);
  }, [today]);

  return (
    <div className="animate-page">
      <header className="pt-safe mx-auto max-w-xl px-4">
        <div className="flex items-start justify-between pt-4">
          <div>
            <p className="text-sm tracking-wide text-muted uppercase">{weekdayLong(today)}</p>
            <h1 className="font-serif text-4xl leading-tight">
              {d.getDate()} {monthName(d.getMonth())}
            </h1>
          </div>
          <Link to="/settings" className="tap -mr-2 rounded-full p-2 text-muted" aria-label="Settings">
            <GearIcon />
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-xl space-y-6 px-4 pt-4 pb-6">
        {entry !== undefined && <TodayOutfit date={today} entry={entry} />}

        <section>
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="font-serif text-xl">This week</h2>
            <Link to="/journal" className="tap text-sm text-muted">
              Journal →
            </Link>
          </div>
          <WeekStrip today={today} />
          {!!streak && (
            <p className="mt-3 text-sm text-muted">
              <span className="font-medium text-ink">{streak}-day streak.</span>{' '}
              {entry ? 'Nice, keep it going.' : 'Log today to keep it going.'}
            </p>
          )}
        </section>

        <ForgottenNudge today={today} />
      </div>
    </div>
  );
}
