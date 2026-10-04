import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { PhotoPicker } from '../../components/items/PhotoPicker';
import { Segmented } from '../../components/ui/Segmented';
import { useSetting } from '../../db/settings';
import { useBlobUrl } from '../../hooks/useBlobUrl';
import { makeCutout, type RemovalProgress } from '../../image/backgroundRemoval';
import { preparePhoto } from '../../image/resize';

export interface PhotoValue {
  original: Blob;
  originalThumb: Blob;
  cutout?: Blob;
  cutoutThumb?: Blob;
  preferOriginal: boolean;
}

type Removal =
  | { state: 'off' }
  | { state: 'running'; progress?: RemovalProgress }
  | { state: 'done' }
  | { state: 'failed' }
  | { state: 'skipped' }
  | { state: 'imported' };

/** Photo → automatic background removal with progress → before/after toggle. Falls back to the original. */
export function PhotoStep({
  value,
  onChange,
  onBusyChange,
}: {
  value?: PhotoValue;
  onChange: (v: PhotoValue | undefined) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const enabled = useSetting('backgroundRemoval');
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string>();
  const [removal, setRemoval] = useState<Removal>({ state: 'off' });
  const token = useRef(0);
  const latest = useRef(value);
  latest.current = value;

  useEffect(() => onBusyChange(preparing || removal.state === 'running'), [preparing, removal.state, onBusyChange]);

  const runRemoval = async (base: PhotoValue) => {
    const mine = ++token.current;
    setRemoval({ state: 'running' });
    try {
      const { cutout, thumbnail } = await makeCutout(base.original, (progress) => {
        if (token.current === mine) setRemoval({ state: 'running', progress });
      });
      if (token.current !== mine) return; // photo changed or skipped meanwhile
      onChange({ ...base, cutout, cutoutThumb: thumbnail, preferOriginal: false });
      setRemoval({ state: 'done' });
    } catch (err) {
      console.warn('Background removal failed', err);
      if (token.current === mine) setRemoval({ state: 'failed' });
    }
  };

  const pick = async (file: File) => {
    token.current++;
    setPreparing(true);
    setError(undefined);
    try {
      const { photo, thumbnail, cutout } = await preparePhoto(file);
      if (cutout) {
        // Already cut out (e.g. iPhone "lift subject"): keep it as the cutout, no removal needed.
        onChange({
          original: photo,
          originalThumb: thumbnail,
          cutout: cutout.cutout,
          cutoutThumb: cutout.thumbnail,
          preferOriginal: false,
        });
        setRemoval({ state: 'imported' });
        return;
      }
      const base: PhotoValue = { original: photo, originalThumb: thumbnail, preferOriginal: true };
      onChange(base);
      if (enabled) void runRemoval(base);
      else setRemoval({ state: 'off' });
    } catch (err) {
      console.error(err);
      setError("Couldn't read that photo. Try another one.");
    } finally {
      setPreparing(false);
    }
  };

  const showCutout = !!value?.cutout && !value.preferOriginal;
  const url = useBlobUrl(showCutout ? value?.cutout : value?.original);

  if (preparing) {
    return (
      <div className="flex aspect-[2/1] items-center justify-center rounded-3xl bg-tile text-sm text-muted">
        Preparing photo…
      </div>
    );
  }
  if (!value || !url) {
    return (
      <>
        <PhotoPicker onPick={pick} />
        {error && <p className="mt-2 text-sm text-accent">{error}</p>}
      </>
    );
  }

  return (
    <div>
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-tile">
        <img
          key={url}
          src={url}
          alt="New piece"
          className={`animate-backdrop ${showCutout ? 'h-[86%] w-[86%] object-contain' : 'h-full w-full object-cover'} ${
            removal.state === 'running' ? 'opacity-60' : ''
          }`}
        />
        {removal.state === 'running' && (
          <RemovalOverlay
            progress={removal.progress}
            onSkip={() => {
              token.current++;
              setRemoval({ state: 'skipped' });
            }}
          />
        )}
      </div>

      <div className="mt-3 space-y-3">
        {value.cutout && removal.state !== 'imported' && (
          <div>
            <Segmented
              options={[
                { id: 'cutout', label: 'Cutout' },
                { id: 'original', label: 'Original' },
              ]}
              value={value.preferOriginal ? 'original' : 'cutout'}
              onChange={(v) => onChange({ ...value, preferOriginal: v === 'original' })}
            />
            <p className="mt-1.5 text-center text-xs text-muted">Keep the original if the cutout looks wrong.</p>
          </div>
        )}
        {removal.state === 'failed' && (
          <p className="text-center text-sm text-muted">
            Couldn't remove the background, so the original photo will be used.{' '}
            <button
              className="tap text-accent underline underline-offset-2"
              onClick={() => void runRemoval(latest.current!)}
            >
              Try again
            </button>
          </p>
        )}
        {removal.state === 'imported' && (
          <p className="text-center text-xs text-muted">
            This photo already has a transparent background, so it's used as the cutout.
          </p>
        )}
        {removal.state === 'off' && (
          <p className="text-center text-xs text-muted">
            Background removal is off.{' '}
            <Link to="/settings" className="underline underline-offset-2">
              Settings
            </Link>
          </p>
        )}
        <div className="flex justify-center">
          <PhotoPicker compact onPick={pick} />
        </div>
      </div>
    </div>
  );
}

export function RemovalOverlay({ progress, onSkip }: { progress?: RemovalProgress; onSkip?: () => void }) {
  const downloading = progress?.stage === 'download';
  const pct = Math.round((progress?.fraction ?? 0) * 100);
  return (
    <div
      className="absolute inset-x-4 bottom-4 rounded-2xl bg-card/95 p-3 shadow-sm backdrop-blur"
      role="status"
      aria-live="polite"
    >
      <div className="mb-2 flex items-baseline justify-between gap-2 text-sm">
        <span>{downloading ? 'Downloading background remover…' : 'Removing background…'}</span>
        {onSkip && (
          <button onClick={onSkip} className="tap shrink-0 text-xs text-muted underline underline-offset-2">
            Skip
          </button>
        )}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-tile">
        {downloading ? (
          <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${pct}%` }} />
        ) : (
          // The model doesn't report progress while it runs, so show an indeterminate bar.
          <div className="animate-indeterminate h-full w-1/3 rounded-full bg-accent" />
        )}
      </div>
      <p className="mt-1.5 text-xs text-muted">
        {downloading
          ? `First time only (${pct}%). After this it works offline.`
          : 'Usually a few seconds. You can keep tagging.'}
      </p>
    </div>
  );
}
