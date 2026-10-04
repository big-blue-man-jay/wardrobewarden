import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { PageHeader } from '../../components/layout/PageHeader';
import { ItemThumb } from '../../components/items/ItemThumb';
import { Collage } from '../../components/looks/Collage';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { CalendarIcon, PencilIcon, TrashIcon } from '../../components/ui/icons';
import { useToast } from '../../components/ui/Toast';
import { occasionLabel, seasonLabel, SEASONS } from '../../config/tags';
import { db } from '../../db/db';
import { logLookOnDay } from '../../db/journal';
import { deleteLook, duplicateLook, useLook } from '../../db/looks';
import type { Item } from '../../db/types';
import { todayISO } from '../../lib/dates';
import { plural } from '../../lib/format';

export function LookPage() {
  const { id } = useParams();
  const look = useLook(id);
  const navigate = useNavigate();
  const toast = useToast();
  const items = useLiveQuery(
    async () => (look ? (await db.items.bulkGet(look.itemIds)).filter((i): i is Item => !!i) : []),
    [look?.itemIds.join(',')],
  );
  const timesWorn = useLiveQuery(() => (id ? db.journal.where('lookId').equals(id).count() : 0), [id]);
  const [confirm, setConfirm] = useState<'delete' | 'replace' | null>(null);

  if (look === null) {
    return (
      <div>
        <PageHeader title="Not found" back backTo="/looks" />
        <EmptyState title="This look doesn't exist anymore" />
      </div>
    );
  }
  if (!look || !items) return <PageHeader title="" back backTo="/looks" />;

  const today = todayISO();
  const wearToday = async (force = false) => {
    const existing = await db.journal.where('date').equals(today).first();
    if (!force && existing && existing.itemIds.length > 0 && existing.lookId !== look.id) {
      setConfirm('replace');
      return;
    }
    await logLookOnDay(today, look);
    setConfirm(null);
    toast('Logged as today’s outfit', { label: 'View', to: `/journal/${today}` });
  };

  const tags = [
    ...look.occasions.map(occasionLabel),
    ...(SEASONS.every((s) => look.seasons.includes(s.id)) ? ['All seasons'] : look.seasons.map(seasonLabel)),
  ];

  return (
    <div className="animate-page">
      <PageHeader
        title=""
        back
        backTo="/looks"
        actions={
          <Link to={`/looks/${look.id}/edit`} className="tap flex items-center gap-1 rounded-full px-3 py-2 text-sm text-muted">
            <PencilIcon size={16} /> Edit
          </Link>
        }
      />
      <div className="mx-auto max-w-xl space-y-6 px-4 pb-10">
        <Collage items={items} className="mx-auto max-w-sm" />
        <div>
          <h1 className="font-serif text-3xl leading-tight">{look.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {[tags.join(' · '), timesWorn ? `worn ${plural(timesWorn, 'time')}` : 'not worn yet'].filter(Boolean).join(' — ')}
          </p>
        </div>

        <Button className="w-full" onClick={() => wearToday()}>
          <CalendarIcon size={20} /> Wear this today
        </Button>

        <section className="border-t border-line pt-5">
          <h2 className="mb-3 font-serif text-xl">Pieces</h2>
          <ul className="grid grid-cols-3 gap-3">
            {items.map((item) => (
              <li key={item.id}>
                <Link to={`/closet/${item.id}`} className="tap block">
                  <ItemThumb item={item} />
                  <p className="mt-1 truncate text-xs">{item.name}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid grid-cols-2 gap-2 border-t border-line pt-5">
          <Button
            variant="secondary"
            onClick={async () => {
              const copy = await duplicateLook(look.id);
              if (copy) {
                toast('Look duplicated');
                // Swap this page for the copy, so saving the edit returns to the copy (not the original).
                navigate(`/looks/${copy}`, { replace: true });
                navigate(`/looks/${copy}/edit`);
              }
            }}
          >
            Duplicate
          </Button>
          <Button variant="ghost" className="text-accent" onClick={() => setConfirm('delete')}>
            <TrashIcon size={18} /> Delete
          </Button>
        </section>
      </div>

      <ConfirmDialog
        open={confirm === 'delete'}
        title={`Delete “${look.name}”?`}
        confirmLabel="Delete look"
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          await deleteLook(look.id);
          toast('Look deleted');
          navigate('/looks', { replace: true });
        }}
      >
        The pieces stay in your closet, and days you wore this look stay in the journal.
      </ConfirmDialog>
      <ConfirmDialog
        open={confirm === 'replace'}
        title="Replace today's outfit?"
        confirmLabel="Replace with this look"
        onCancel={() => setConfirm(null)}
        onConfirm={() => wearToday(true)}
      >
        You already logged other pieces today. Your photo, rating and note for today are kept.
      </ConfirmDialog>
    </div>
  );
}
