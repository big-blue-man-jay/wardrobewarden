import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { BottomActionBar } from '../../components/layout/BottomActionBar';
import { PageHeader } from '../../components/layout/PageHeader';
import { PhotoPicker } from '../../components/items/PhotoPicker';
import { PurchaseDateField } from '../../components/items/PurchaseDateField';
import {
  CategoryField,
  ColorsField,
  ConditionField,
  MaterialField,
  OccasionsField,
  SeasonsField,
  SubcategoryField,
} from '../../components/items/TagFields';
import { Button } from '../../components/ui/Button';
import { ChevronRightIcon } from '../../components/ui/icons';
import { TextArea, TextField, parsePrice } from '../../components/ui/TextField';
import { useToast } from '../../components/ui/Toast';
import type { CategoryId, OccasionId, SeasonId } from '../../config/tags';
import { addItem } from '../../db/items';
import { getSetting, setSetting } from '../../db/settings';
import { useBlobUrl } from '../../hooks/useBlobUrl';
import { preparePhoto } from '../../image/resize';
import { findSimilar, pluralize } from '../../lib/insights';
import { generateItemName } from '../../lib/naming';
import { useItems } from '../../db/items';
import { ItemThumb } from '../../components/items/ItemThumb';

interface Photo {
  original: Blob;
  thumbnail: Blob;
}

export function AddItemPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [photo, setPhoto] = useState<Photo>();
  const [processing, setProcessing] = useState(false);
  const [photoError, setPhotoError] = useState<string>();

  const [category, setCategory] = useState<CategoryId>();
  const [subcategory, setSubcategory] = useState<string>();
  const [colors, setColors] = useState<string[]>([]);
  const [seasons, setSeasons] = useState<SeasonId[]>([]);
  const [occasions, setOccasions] = useState<OccasionId[]>([]);
  const [material, setMaterial] = useState<string>();
  const [purchaseDate, setPurchaseDate] = useState<string>();

  const [showMore, setShowMore] = useState(false);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('');
  const [price, setPrice] = useState('');
  const [boughtAt, setBoughtAt] = useState('');
  const [condition, setCondition] = useState<'new' | 'secondhand'>();
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Pre-fill seasons/occasions from the last piece I added, to speed up adding similar pieces.
  useEffect(() => {
    getSetting('lastSeasons').then(setSeasons);
    getSetting('lastOccasions').then(setOccasions);
  }, []);

  const previewUrl = useBlobUrl(photo?.original);
  const autoName = generateItemName(category, subcategory, colors);
  const canSave = !!photo && !!category && !saving;
  const allItems = useItems();
  const similar = useMemo(
    () => (allItems ? findSimilar(allItems, { category, subcategory, colors }) : []),
    [allItems, category, subcategory, colors],
  );

  const pickPhoto = async (file: File) => {
    setProcessing(true);
    setPhotoError(undefined);
    try {
      const { photo: original, thumbnail } = await preparePhoto(file);
      setPhoto({ original, thumbnail });
    } catch (err) {
      console.error(err);
      setPhotoError("Couldn't read that photo. Try another one.");
    } finally {
      setProcessing(false);
    }
  };

  const changeCategory = (c: CategoryId) => {
    if (c !== category) setSubcategory(undefined);
    setCategory(c);
  };

  const save = async () => {
    if (!photo || !category) return;
    setSaving(true);
    try {
      const id = await addItem({
        name: name.trim() || autoName,
        category,
        subcategory,
        colors,
        seasons,
        occasions,
        material,
        brand: brand.trim() || undefined,
        size: size.trim() || undefined,
        price: parsePrice(price),
        purchaseDate,
        boughtAt: boughtAt.trim() || undefined,
        condition,
        notes: notes.trim() || undefined,
        photoOriginal: photo.original,
        preferOriginal: false,
        thumbnail: photo.thumbnail,
      });
      await Promise.all([setSetting('lastSeasons', seasons), setSetting('lastOccasions', occasions)]);
      toast('Piece saved');
      navigate(`/closet/${id}`, { replace: true });
    } catch (err) {
      console.error(err);
      toast("Couldn't save. Is the device storage full?");
      setSaving(false);
    }
  };

  return (
    <>
      <div className="animate-page">
        <PageHeader title="Add piece" back backTo="/closet" />
        <div className="mx-auto max-w-xl space-y-7 px-4 pb-32">
          <section>
            {photo && previewUrl ? (
              <div>
                <div className="flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-tile">
                  <img src={previewUrl} alt="New piece" className="h-full w-full object-cover" />
                </div>
                <div className="mt-3 flex justify-center">
                  <PhotoPicker compact onPick={pickPhoto} />
                </div>
              </div>
            ) : processing ? (
              <div className="flex aspect-[2/1] items-center justify-center rounded-3xl bg-tile text-sm text-muted">
                Preparing photo…
              </div>
            ) : (
              <PhotoPicker onPick={pickPhoto} />
            )}
            {photoError && <p className="mt-2 text-sm text-accent">{photoError}</p>}
          </section>

          <CategoryField value={category} onChange={changeCategory} />
          <SubcategoryField category={category} value={subcategory} onChange={setSubcategory} />
          <ColorsField value={colors} onChange={setColors} />
          <SeasonsField value={seasons} onChange={setSeasons} />
          <OccasionsField value={occasions} onChange={setOccasions} />
          <MaterialField value={material} onChange={setMaterial} />
          <PurchaseDateField value={purchaseDate} onChange={setPurchaseDate} />

          <section>
            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              className="tap flex w-full items-center justify-between rounded-xl border border-line bg-card px-4 py-3"
            >
              <span>
                <span className="block font-medium">More details</span>
                <span className="block text-xs text-muted">Name, brand, size, price, where bought, notes</span>
              </span>
              <ChevronRightIcon className={`transition-transform ${showMore ? 'rotate-90' : ''}`} />
            </button>
            {showMore && (
              <div className="animate-page mt-4 space-y-4">
                <TextField
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={autoName || 'e.g. Black jeans'}
                />
                <div className="grid grid-cols-2 gap-3">
                  <TextField label="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
                  <TextField label="Size" value={size} onChange={(e) => setSize(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <TextField
                    label="Price"
                    inputMode="decimal"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                  />
                  <TextField label="Where bought" value={boughtAt} onChange={(e) => setBoughtAt(e.target.value)} />
                </div>
                <ConditionField value={condition} onChange={setCondition} />
                <TextArea
                  label="Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Fit, care, the story behind it…"
                />
              </div>
            )}
          </section>
        </div>
      </div>
      <BottomActionBar>
        {similar.length > 0 && (
          <div className="animate-page mb-3 flex items-center gap-3 rounded-2xl bg-accent-soft p-2.5" role="status">
            <div className="flex shrink-0 -space-x-3">
              {similar.slice(0, 3).map((i) => (
                <ItemThumb key={i.id} item={i} className="w-10 rounded-xl ring-2 ring-accent-soft" />
              ))}
            </div>
            <p className="text-sm leading-snug text-ink">
              {similar.length === 1 ? (
                <>
                  You already have something similar: <strong className="font-medium">{similar[0].name}</strong>.
                </>
              ) : (
                <>
                  You already have {similar.length} {pluralize(autoName.toLowerCase())}.
                </>
              )}
              <span className="text-muted"> Still want to add it?</span>
            </p>
          </div>
        )}
        <Button className="w-full" disabled={!canSave} onClick={save}>
          {saving
            ? 'Saving…'
            : !photo
              ? 'Add a photo to save'
              : !category
                ? 'Pick a category to save'
                : `Save ${name.trim() || autoName}`}
        </Button>
      </BottomActionBar>
    </>
  );
}
