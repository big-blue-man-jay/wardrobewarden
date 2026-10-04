import { useRef, type ReactNode } from 'react';
import { CameraIcon, ImageIcon } from '../ui/icons';

/** "Take photo" opens the camera directly; "Choose photo" opens the camera roll / files. */
export function PhotoPicker({ onPick, compact }: { onPick: (file: File) => void; compact?: boolean }) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again
    if (file) onPick(file);
  };
  return (
    <div className={compact ? 'flex gap-2' : 'grid grid-cols-2 gap-3'}>
      <PickButton compact={compact} icon={<CameraIcon />} label="Take photo" onClick={() => cameraRef.current?.click()} />
      <PickButton compact={compact} icon={<ImageIcon />} label="Choose photo" onClick={() => libraryRef.current?.click()} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={handle} />
      <input ref={libraryRef} type="file" accept="image/*" hidden onChange={handle} />
    </div>
  );
}

function PickButton({ icon, label, onClick, compact }: { icon: ReactNode; label: string; onClick: () => void; compact?: boolean }) {
  if (compact) {
    return (
      <button type="button" onClick={onClick} className="tap flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-2 text-sm">
        {icon}
        {label}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="tap flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-muted/40 bg-tile py-8 text-ink"
    >
      <span className="rounded-full bg-card p-3">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
