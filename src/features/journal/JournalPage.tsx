import { Link } from 'react-router';
import { PageHeader } from '../../components/layout/PageHeader';
import { ThumbStrip } from '../../components/items/ThumbStrip';
import { EmptyState } from '../../components/ui/EmptyState';
import { CalendarIcon } from '../../components/ui/icons';
import { useJournal } from '../../db/journal';
import { formatDay } from '../../lib/dates';

// M1 preview feed; the calendar and entry editor come in M5.
export function JournalPage() {
  const entries = useJournal();
  return (
    <div className="animate-page">
      <PageHeader title="Journal" />
      <div className="mx-auto max-w-3xl space-y-3 px-4">
        {entries?.length === 0 && (
          <EmptyState icon={<CalendarIcon size={28} />} title="No outfits logged">
            Tap + and choose <em>Log today's outfit</em>.
          </EmptyState>
        )}
        {entries?.map((e) => (
          <Link key={e.id} to={`/journal/${e.date}`} className="tap block rounded-2xl border border-line bg-card p-3">
            <div className="mb-2 flex items-baseline justify-between">
              <p className="font-serif text-lg">{formatDay(e.date)}</p>
              {e.rating && <span className="text-sm text-accent">{'★'.repeat(e.rating)}</span>}
            </div>
            <ThumbStrip itemIds={e.itemIds} />
            {e.note && <p className="mt-2 text-sm text-muted">{e.note}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
