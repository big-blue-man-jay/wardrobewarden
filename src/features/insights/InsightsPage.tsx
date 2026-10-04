import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ItemThumb } from '../../components/items/ItemThumb';
import { PageHeader } from '../../components/layout/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { ChartIcon } from '../../components/ui/icons';
import { Segmented } from '../../components/ui/Segmented';
import { FORGOTTEN_AFTER_DAYS } from '../../config/app';
import { db } from '../../db/db';
import { useItems } from '../../db/items';
import { useSetting } from '../../db/settings';
import { useWearMap } from '../../db/wear';
import { formatDay, todayISO } from '../../lib/dates';
import { formatMoney, plural } from '../../lib/format';
import { computeInsights, loggedPerMonth, type Ranked } from '../../lib/insights';
import { BarRows, ColorLabel, InsightCard, MonthColumns, PaletteGrid, StatTile } from './charts';

export function InsightsPage() {
  const items = useItems();
  const wear = useWearMap();
  const dates = useLiveQuery(() => db.journal.toArray().then((es) => es.map((e) => ({ date: e.date }))), []);
  const currency = useSetting('currency');
  const today = todayISO();
  const [wornView, setWornView] = useState<'most' | 'least'>('most');
  const [valueView, setValueView] = useState<'best' | 'worst'>('best');

  const ins = useMemo(() => (items && wear ? computeInsights(items, wear, today) : undefined), [items, wear, today]);
  const months = useMemo(() => (dates ? loggedPerMonth(dates, today) : undefined), [dates, today]);
  const money = (n: number | undefined) => (n === undefined ? '–' : formatMoney(n, currency));

  if (!ins || !months) return <PageHeader title="Insights" />;
  if (ins.totalItems === 0) {
    return (
      <div className="animate-page">
        <PageHeader title="Insights" />
        <EmptyState icon={<ChartIcon size={28} />} title="Nothing to analyse yet">
          Add pieces and log a few outfits; insights about your wardrobe show up here.
        </EmptyState>
      </div>
    );
  }
  const thisMonth = months[months.length - 1];

  return (
    <div className="animate-page">
      <PageHeader title="Insights" />
      <div className="mx-auto max-w-3xl space-y-4 px-4 pb-6">
        <div className="grid grid-cols-3 gap-2">
          <StatTile label="Pieces" value={String(ins.totalItems)} />
          <StatTile
            label="Wardrobe value"
            value={money(ins.totalValue)}
            hint={ins.pricedItems < ins.totalItems ? `${ins.pricedItems} of ${ins.totalItems} priced` : undefined}
          />
          <StatTile label="Avg. cost/wear" value={money(ins.avgCpw)} />
        </div>

        <InsightCard title="Your palette" subtitle="One square per piece, in its main color. Tap one to open it.">
          <PaletteGrid items={ins.palette} />
          <div className="mt-4">
            <BarRows rows={ins.byColor.map((c) => ({ key: c.id, label: <ColorLabel id={c.id} />, value: c.count }))} />
          </div>
        </InsightCard>

        <InsightCard title="By category">
          <BarRows rows={ins.byCategory.map((c) => ({ key: c.id, label: c.label, value: c.count }))} />
        </InsightCard>

        <InsightCard
          title="Forgotten pieces"
          subtitle={`${plural(ins.idle.length, 'piece')} not worn in ${FORGOTTEN_AFTER_DAYS}+ days · ${ins.neverWorn.length} never worn`}
        >
          {ins.idle.length + ins.neverWorn.length === 0 ? (
            <p className="text-sm text-muted">Nothing forgotten. You're wearing your whole closet.</p>
          ) : (
            <div className="space-y-4">
              {ins.idle.length > 0 && (
                <ForgottenRow
                  title={`Not worn in ${FORGOTTEN_AFTER_DAYS}+ days`}
                  rows={ins.idle}
                  detail={(r) => `${r.idle} days ago`}
                />
              )}
              {ins.neverWorn.length > 0 && (
                <ForgottenRow title="Never worn" rows={ins.neverWorn} detail={(r) => `added ${r.idle} days ago`} />
              )}
            </div>
          )}
        </InsightCard>

        <InsightCard title="Wear">
          <div className="mb-3">
            <Segmented
              options={[
                { id: 'most', label: 'Most worn' },
                { id: 'least', label: 'Least worn' },
              ]}
              value={wornView}
              onChange={setWornView}
            />
          </div>
          <RankList
            rows={wornView === 'most' ? ins.mostWorn : ins.leastWorn}
            right={(r) => plural(r.wear.count, 'wear')}
            sub={(r) => (r.wear.last ? `last ${formatDay(r.wear.last)}` : 'never worn')}
            empty="Log some outfits to see what you reach for most."
          />
        </InsightCard>

        <InsightCard title="Cost per wear" subtitle="Price ÷ times worn. Pieces without a price are left out.">
          <div className="mb-3">
            <Segmented
              options={[
                { id: 'best', label: 'Best value' },
                { id: 'worst', label: 'Worst value' },
              ]}
              value={valueView}
              onChange={setValueView}
            />
          </div>
          <RankList
            rows={valueView === 'best' ? ins.bestValue : ins.worstValue}
            right={(r) => money(r.cpw)}
            sub={(r) => `${money(r.item.price)} · ${r.wear.count ? plural(r.wear.count, 'wear') : 'not worn yet'}`}
            empty="Add prices to your pieces to see their cost per wear."
          />
        </InsightCard>

        <InsightCard
          title="Days logged"
          subtitle={`${thisMonth.count} of ${plural(thisMonth.days, 'day')} so far this month`}
        >
          <MonthColumns months={months} />
        </InsightCard>
      </div>
    </div>
  );
}

function ForgottenRow({ title, rows, detail }: { title: string; rows: Ranked[]; detail: (r: Ranked) => string }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">{title}</p>
      <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {rows.map((r) => (
          <li key={r.item.id} className="w-28 shrink-0">
            <Link to={`/closet/${r.item.id}`} className="tap block">
              <ItemThumb item={r.item} />
              <p className="mt-1 truncate text-sm">{r.item.name}</p>
              <p className="truncate text-xs text-muted">{detail(r)}</p>
            </Link>
            <Link
              to={`/looks/new?item=${r.item.id}`}
              className="tap mt-1.5 block rounded-full border border-line py-1.5 text-center text-xs font-medium"
            >
              Style this
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RankList({
  rows,
  right,
  sub,
  empty,
}: {
  rows: Ranked[];
  right: (r: Ranked) => string;
  sub: (r: Ranked) => string;
  empty: string;
}) {
  if (rows.length === 0) return <p className="text-sm text-muted">{empty}</p>;
  return (
    <ol className="divide-y divide-line">
      {rows.map((r, i) => (
        <li key={r.item.id}>
          <Link to={`/closet/${r.item.id}`} className="tap flex items-center gap-3 py-2">
            <span className="w-4 text-right text-xs text-muted tabular-nums">{i + 1}</span>
            <ItemThumb item={r.item} className="w-11 rounded-xl" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px]">{r.item.name}</span>
              <span className="block truncate text-xs text-muted">{sub(r)}</span>
            </span>
            <span className="text-sm font-medium tabular-nums">{right(r)}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
