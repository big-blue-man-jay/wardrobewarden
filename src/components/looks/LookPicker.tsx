import { useLooks } from '../../db/looks';
import type { Look } from '../../db/types';
import { BottomSheet } from '../ui/BottomSheet';
import { CollageById } from './Collage';

export function LookPicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (look: Look) => void;
}) {
  const looks = useLooks();
  return (
    <BottomSheet open={open} onClose={onClose} title="Pick a saved look">
      {looks?.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">No saved looks yet. Build one in the Looks tab.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3">
          {looks?.map((look) => (
            <li key={look.id}>
              <button
                onClick={() => {
                  onPick(look);
                  onClose();
                }}
                className="tap block w-full text-left"
              >
                <CollageById itemIds={look.itemIds} />
                <p className="mt-1 truncate px-1 text-sm">{look.name}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </BottomSheet>
  );
}
