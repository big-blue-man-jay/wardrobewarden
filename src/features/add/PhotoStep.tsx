import { useEffect, useState } from 'react';
import { PhotoPicker } from '../../components/items/PhotoPicker';
import { useBlobUrl } from '../../hooks/useBlobUrl';
import { preparePhoto } from '../../image/resize';

export interface PhotoValue {
  original: Blob;
  originalThumb: Blob;
  cutout?: Blob;
  cutoutThumb?: Blob;
  preferOriginal: boolean;
}

/** Take or choose a photo. Photos that already have a transparent background (e.g. an iPhone
 *  "lift subject" cutout) are kept as the cutout, so they sit on the neutral tile like a flat-lay. */
export function PhotoStep({
  value,
  onChange,
  onBusyChange,
}: {
  value?: PhotoValue;
  onChange: (v: PhotoValue | undefined) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => onBusyChange(preparing), [preparing, onBusyChange]);

  const pick = async (file: File) => {
    setPreparing(true);
    setError(undefined);
    try {
      const { photo, thumbnail, cutout } = await preparePhoto(file);
      onChange({
        original: photo,
        originalThumb: thumbnail,
        cutout: cutout?.cutout,
        cutoutThumb: cutout?.thumbnail,
        preferOriginal: !cutout,
      });
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
        <p className="mt-2 text-center text-xs text-muted">
          Tip: on iPhone, touch and hold the piece in Photos to lift it from the background, save it, then choose it
          here for a clean cutout.
        </p>
        {error && <p className="mt-2 text-sm text-accent">{error}</p>}
      </>
    );
  }

  return (
    <div>
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-tile">
        <img
          key={url}
          src={url}
          alt="New piece"
          className={`animate-backdrop ${showCutout ? 'h-[86%] w-[86%] object-contain' : 'h-full w-full object-cover'}`}
        />
      </div>
      <div className="mt-3 space-y-3">
        {value.cutout && (
          <p className="text-center text-xs text-muted">
            This photo has a transparent background, so it's used as a cutout.
          </p>
        )}
        <div className="flex justify-center">
          <PhotoPicker compact onPick={pick} />
        </div>
      </div>
    </div>
  );
}
