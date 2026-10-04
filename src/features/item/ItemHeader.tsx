import { useState } from 'react';
import { HeartIcon } from '../../components/ui/icons';
import { useToast } from '../../components/ui/Toast';
import { categoryLabel, subcategoryLabel } from '../../config/tags';
import { updateItem } from '../../db/items';
import type { Item } from '../../db/types';
import { useBlobUrl } from '../../hooks/useBlobUrl';
import { makeThumbnail } from '../../image/resize';

/** Large photo (tap to switch between cutout and original), name and favorite toggle. */
export function ItemHeader({ item, onEditName }: { item: Item; onEditName: () => void }) {
  const toast = useToast();
  const hasBoth = !!item.photoCutout;
  const [showOther, setShowOther] = useState(false);
  const mainIsCutout = hasBoth && !item.preferOriginal;
  const showingCutout = showOther ? !mainIsCutout && hasBoth : mainIsCutout;
  const url = useBlobUrl(showingCutout ? item.photoCutout : item.photoOriginal);

  const kind = [categoryLabel(item.category), item.subcategory && subcategoryLabel(item.category, item.subcategory)]
    .filter(Boolean)
    .join(' · ');

  /** Make the photo currently on screen the one used in the closet, looks and journal. */
  const useShown = async () => {
    const blob = showingCutout ? item.photoCutout! : item.photoOriginal;
    await updateItem(item.id, { preferOriginal: !showingCutout, thumbnail: await makeThumbnail(blob, showingCutout) });
    setShowOther(false);
    toast(showingCutout ? 'Using the cutout' : 'Using the original photo');
  };

  return (
    <header>
      <div className="relative">
        <button
          type="button"
          onClick={() => hasBoth && setShowOther((v) => !v)}
          className={`flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl bg-tile ${hasBoth ? 'cursor-pointer' : 'cursor-default'}`}
          aria-label={hasBoth ? 'Switch between cutout and original photo' : item.name}
        >
          {url && (
            <img
              key={url}
              src={url}
              alt={item.name}
              className={`animate-backdrop ${showingCutout ? 'h-[86%] w-[86%] object-contain' : 'h-full w-full object-cover'}`}
            />
          )}
        </button>
        {hasBoth && (
          <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-card/85 px-2.5 py-1 text-xs text-muted backdrop-blur">
            {showingCutout ? 'Cutout' : 'Original'} · tap to switch
          </span>
        )}
        {showOther && (
          <button
            onClick={useShown}
            className="tap absolute right-3 bottom-3 rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-paper"
          >
            Use this photo
          </button>
        )}
        <button
          onClick={() => updateItem(item.id, { favorite: !item.favorite })}
          className={`tap absolute top-3 right-3 rounded-full bg-card/90 p-2.5 backdrop-blur ${item.favorite ? 'text-accent' : 'text-muted'}`}
          aria-label={item.favorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={item.favorite}
        >
          <HeartIcon filled={item.favorite} />
        </button>
      </div>
      <button onClick={onEditName} className="tap mt-4 block text-left">
        <h1 className="font-serif text-3xl leading-tight">{item.name}</h1>
        <p className="mt-1 text-sm text-muted">{kind}</p>
      </button>
    </header>
  );
}
