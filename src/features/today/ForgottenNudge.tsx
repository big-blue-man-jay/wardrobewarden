import { Link } from 'react-router';
import { ItemThumb } from '../../components/items/ItemThumb';
import { useItems } from '../../db/items';
import { daysIdle, isForgotten, NO_WEAR, useWearMap } from '../../db/wear';
import { daysBetween } from '../../lib/dates';

/** Suggests one forgotten piece (rotates daily). */
export function ForgottenNudge({ today }: { today: string }) {
  const items = useItems();
  const wear = useWearMap();
  if (!items || !wear) return null;
  const forgotten = items
    .map((item) => ({ item, w: wear.get(item.id) ?? NO_WEAR }))
    .filter(({ item, w }) => isForgotten(item, w, today))
    .sort((a, b) => daysIdle(b.item, b.w, today) - daysIdle(a.item, a.w, today));
  if (forgotten.length === 0) return null;

  const { item, w } = forgotten[Math.abs(daysBetween('2000-01-01', today)) % forgotten.length];
  const idle = daysIdle(item, w, today);
  return (
    <section className="flex items-center gap-4 rounded-3xl border border-line bg-card p-3">
      <Link to={`/closet/${item.id}`} className="tap w-20 shrink-0">
        <ItemThumb item={item} />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="text-xs tracking-wide text-muted uppercase">Forgotten piece</p>
        <p className="mt-0.5 text-[15px] leading-snug">
          {w.count === 0 ? (
            <>
              You've never worn your <strong className="font-medium">{item.name.toLowerCase()}</strong>.
            </>
          ) : (
            <>
              Your <strong className="font-medium">{item.name.toLowerCase()}</strong> hasn't been worn in {idle} days.
            </>
          )}
        </p>
        <Link to={`/looks/new?item=${item.id}`} className="tap mt-1 inline-block text-sm text-accent">
          Style it →
        </Link>
      </div>
    </section>
  );
}
