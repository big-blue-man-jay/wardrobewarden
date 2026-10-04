import { Link } from 'react-router';
import { EntryThumb } from '../../components/journal/EntryThumb';
import { useEntriesBetween } from '../../db/journal';
import { addDays, parseISODate, startOfWeek, weekdayShort } from '../../lib/dates';

/** Mon–Sun with a small thumbnail for each logged day. Tap a day to open it in the journal. */
export function WeekStrip({ today }: { today: string }) {
  const monday = startOfWeek(today);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const entries = useEntriesBetween(days[0], days[6]);
  const logged = days.filter((d) => entries?.has(d)).length;

  return (
    <div>
      <ol className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const entry = entries?.get(day);
          const isToday = day === today;
          const future = day > today;
          return (
            <li key={day}>
              <Link
                to={future ? '#' : `/journal/${day}`}
                aria-disabled={future}
                className={`tap flex flex-col items-center gap-1 ${future ? 'pointer-events-none opacity-40' : ''}`}
              >
                <span className={`text-[11px] ${isToday ? 'font-semibold text-accent' : 'text-muted'}`}>
                  {weekdayShort(day).charAt(0)}
                </span>
                {entry ? (
                  <EntryThumb entry={entry} className={`w-full ${isToday ? 'ring-2 ring-accent' : ''}`} />
                ) : (
                  <span
                    className={`flex aspect-square w-full items-center justify-center rounded-xl border border-dashed text-xs ${
                      isToday ? 'border-accent text-accent' : 'border-line text-muted'
                    }`}
                  >
                    {parseISODate(day).getDate()}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-xs text-muted">{logged} of 7 days logged</p>
    </div>
  );
}
