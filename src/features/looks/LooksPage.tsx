import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { PageHeader } from '../../components/layout/PageHeader';
import { CollageById } from '../../components/looks/Collage';
import { Chip } from '../../components/ui/Chip';
import { EmptyState } from '../../components/ui/EmptyState';
import { LayersIcon, PlusIcon } from '../../components/ui/icons';
import { OCCASIONS, SEASONS, occasionLabel, type OccasionId, type SeasonId } from '../../config/tags';
import { useLooks } from '../../db/looks';
import { plural } from '../../lib/format';

export function LooksPage() {
  const looks = useLooks();
  const [occasion, setOccasion] = useState<OccasionId>();
  const [season, setSeason] = useState<SeasonId>();

  const visible = useMemo(
    () =>
      looks?.filter(
        (l) => (!occasion || l.occasions.includes(occasion)) && (!season || l.seasons.includes(season)),
      ),
    [looks, occasion, season],
  );

  return (
    <div className="animate-page">
      <PageHeader
        title="Looks"
        subtitle={looks && visible ? (occasion || season ? `${visible.length} of ${looks.length} looks` : plural(looks.length, 'look')) : undefined}
        actions={
          <Link to="/looks/new" className="tap flex items-center gap-1 rounded-full bg-ink py-2 pr-4 pl-3 text-sm font-medium text-paper">
            <PlusIcon size={18} /> New look
          </Link>
        }
      >
        {!!looks?.length && (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
            {OCCASIONS.map((o) => (
              <Chip key={o.id} className="shrink-0 !min-h-9 !px-3 text-sm" selected={occasion === o.id} onClick={() => setOccasion(occasion === o.id ? undefined : o.id)}>
                {o.label}
              </Chip>
            ))}
            <span className="w-px shrink-0 bg-line" />
            {SEASONS.map((s) => (
              <Chip key={s.id} className="shrink-0 !min-h-9 !px-3 text-sm" selected={season === s.id} onClick={() => setSeason(season === s.id ? undefined : s.id)}>
                {s.label}
              </Chip>
            ))}
          </div>
        )}
      </PageHeader>

      <div className="mx-auto max-w-3xl px-4 pt-1">
        {looks?.length === 0 && (
          <EmptyState icon={<LayersIcon size={28} />} title="No looks yet">
            Combine pieces into full outfits. Tap <strong>New look</strong>, or <em>Style this</em> on any piece.
          </EmptyState>
        )}
        {looks && looks.length > 0 && visible?.length === 0 && (
          <EmptyState title="No looks match">Try another occasion or season.</EmptyState>
        )}
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {visible?.map((look) => (
            <li key={look.id} className="animate-page">
              <Link to={`/looks/${look.id}`} className="tap block">
                <CollageById itemIds={look.itemIds} />
                <p className="mt-1.5 truncate px-1 font-serif text-[17px]">{look.name}</p>
                <p className="truncate px-1 text-xs text-muted">
                  {look.occasions.map(occasionLabel).join(', ') || plural(look.itemIds.length, 'piece')}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
