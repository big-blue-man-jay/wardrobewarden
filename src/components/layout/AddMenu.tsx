import { useNavigate } from 'react-router';
import { todayISO } from '../../lib/dates';
import { BottomSheet } from '../ui/BottomSheet';
import { CalendarIcon, CameraIcon } from '../ui/icons';

export function AddMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const go = (path: string) => {
    onClose();
    navigate(path);
  };
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="grid gap-3 pt-1">
        <MenuButton
          icon={<CameraIcon />}
          title="Add piece"
          hint="Photograph a new piece of clothing"
          onClick={() => go('/add')}
        />
        <MenuButton
          icon={<CalendarIcon />}
          title="Log today's outfit"
          hint="Pick what you're wearing today"
          onClick={() => go(`/journal/${todayISO()}`)}
        />
      </div>
    </BottomSheet>
  );
}

function MenuButton({ icon, title, hint, onClick }: { icon: React.ReactNode; title: string; hint: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="tap flex items-center gap-4 rounded-2xl border border-line bg-paper p-4 text-left">
      <span className="rounded-full bg-accent-soft p-3 text-accent">{icon}</span>
      <span>
        <span className="block font-medium">{title}</span>
        <span className="block text-sm text-muted">{hint}</span>
      </span>
    </button>
  );
}
