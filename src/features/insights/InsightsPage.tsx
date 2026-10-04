import { useLiveQuery } from 'dexie-react-hooks';
import { PageHeader } from '../../components/layout/PageHeader';
import { db } from '../../db/db';
import { useSetting } from '../../db/settings';
import { formatMoney } from '../../lib/format';

// M1 preview totals; full insights come in M6.
export function InsightsPage() {
  const currency = useSetting('currency');
  const stats = useLiveQuery(async () => {
    const items = await db.items.toArray();
    return {
      items: items.length,
      value: items.reduce((sum, i) => sum + (i.price ?? 0), 0),
      days: await db.journal.count(),
    };
  });
  return (
    <div className="animate-page">
      <PageHeader title="Insights" />
      <div className="mx-auto grid max-w-3xl grid-cols-3 gap-3 px-4">
        <Stat label="Pieces" value={stats?.items ?? '–'} />
        <Stat label="Value" value={stats ? formatMoney(stats.value, currency) : '–'} />
        <Stat label="Days logged" value={stats?.days ?? '–'} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-3">
      <p className="font-serif text-2xl">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
