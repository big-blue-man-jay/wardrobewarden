import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { CalendarIcon, SparkleIcon, TrashIcon } from '../../components/ui/icons';
import { useToast } from '../../components/ui/Toast';
import { deleteItem, itemUsage } from '../../db/items';
import { addItemsToDay } from '../../db/journal';
import type { Item } from '../../db/types';
import { todayISO } from '../../lib/dates';
import { plural } from '../../lib/format';

export function ItemActions({ item }: { item: Item }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [confirm, setConfirm] = useState<{ looks: number; entries: number } | null>(null);

  const logToday = async () => {
    const today = todayISO();
    const added = await addItemsToDay(today, [item.id]);
    toast(added ? 'Logged as worn today' : 'Already in today’s outfit', { label: 'View', to: `/journal/${today}` });
  };

  const remove = async () => {
    await deleteItem(item.id);
    setConfirm(null);
    toast(`Deleted ${item.name}`);
    navigate('/closet', { replace: true });
  };

  return (
    <section className="grid gap-2 border-t border-line pt-5">
      <Button onClick={() => navigate(`/looks/new?item=${item.id}`)}>
        <SparkleIcon size={20} /> Style this
      </Button>
      <Button variant="secondary" onClick={logToday}>
        <CalendarIcon size={20} /> Log as worn today
      </Button>
      <Button variant="ghost" className="text-accent" onClick={async () => setConfirm(await itemUsage(item.id))}>
        <TrashIcon size={20} /> Delete piece
      </Button>
      <ConfirmDialog
        open={!!confirm}
        title={`Delete ${item.name}?`}
        confirmLabel="Delete"
        danger
        onConfirm={remove}
        onCancel={() => setConfirm(null)}
      >
        {confirm && (confirm.looks > 0 || confirm.entries > 0) ? (
          <>
            It's in {plural(confirm.looks, 'look')} and {plural(confirm.entries, 'journal day')}. It will be removed
            from those too. This can't be undone.
          </>
        ) : (
          <>This can't be undone.</>
        )}
      </ConfirmDialog>
    </section>
  );
}
