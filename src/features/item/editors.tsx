import { useState, type ReactNode } from 'react';
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
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Button } from '../../components/ui/Button';
import { TextArea, TextField, parsePrice } from '../../components/ui/TextField';
import { isValidSubcategory } from '../../config/tags';
import { updateItem } from '../../db/items';
import type { Item } from '../../db/types';
import { generateItemName } from '../../lib/naming';

export type EditorKind = 'name' | 'basics' | 'purchase' | 'notes';

/** One editor sheet per profile section, each with its own draft and Save button. */
export function ItemEditor({ item, kind, onClose }: { item: Item; kind: EditorKind | null; onClose: () => void }) {
  return (
    <>
      {kind === 'name' && <NameEditor item={item} onClose={onClose} />}
      {kind === 'basics' && <BasicsEditor item={item} onClose={onClose} />}
      {kind === 'purchase' && <PurchaseEditor item={item} onClose={onClose} />}
      {kind === 'notes' && <NotesEditor item={item} onClose={onClose} />}
    </>
  );
}

function EditorSheet({ title, onClose, onSave, children }: { title: string; onClose: () => void; onSave: () => Promise<void>; children: ReactNode }) {
  const [saving, setSaving] = useState(false);
  return (
    <BottomSheet open onClose={onClose} title={title}>
      <div className="space-y-6">{children}</div>
      <div className="mt-6 grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            await onSave();
            onClose();
          }}
        >
          Save
        </Button>
      </div>
    </BottomSheet>
  );
}

function NameEditor({ item, onClose }: { item: Item; onClose: () => void }) {
  const [name, setName] = useState(item.name);
  const auto = generateItemName(item.category, item.subcategory, item.colors);
  return (
    <EditorSheet title="Name" onClose={onClose} onSave={() => updateItem(item.id, { name: name.trim() || auto })}>
      <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder={auto} autoFocus />
    </EditorSheet>
  );
}

function BasicsEditor({ item, onClose }: { item: Item; onClose: () => void }) {
  const [d, setD] = useState({
    category: item.category,
    subcategory: item.subcategory,
    colors: item.colors,
    seasons: item.seasons,
    occasions: item.occasions,
    material: item.material,
    brand: item.brand ?? '',
    size: item.size ?? '',
  });
  const set = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => setD((prev) => ({ ...prev, [k]: v }));
  return (
    <EditorSheet
      title="Basics"
      onClose={onClose}
      onSave={() =>
        updateItem(item.id, {
          ...d,
          subcategory: isValidSubcategory(d.category, d.subcategory) ? d.subcategory : undefined,
          brand: d.brand.trim() || undefined,
          size: d.size.trim() || undefined,
        })
      }
    >
      <CategoryField
        value={d.category}
        onChange={(c) => setD((p) => ({ ...p, category: c, subcategory: c === p.category ? p.subcategory : undefined }))}
      />
      <SubcategoryField category={d.category} value={d.subcategory} onChange={(v) => set('subcategory', v)} />
      <ColorsField value={d.colors} onChange={(v) => set('colors', v)} />
      <SeasonsField value={d.seasons} onChange={(v) => set('seasons', v)} />
      <OccasionsField value={d.occasions} onChange={(v) => set('occasions', v)} />
      <MaterialField value={d.material} onChange={(v) => set('material', v)} />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Brand" value={d.brand} onChange={(e) => set('brand', e.target.value)} />
        <TextField label="Size" value={d.size} onChange={(e) => set('size', e.target.value)} />
      </div>
    </EditorSheet>
  );
}

function PurchaseEditor({ item, onClose }: { item: Item; onClose: () => void }) {
  const [purchaseDate, setPurchaseDate] = useState(item.purchaseDate);
  const [price, setPrice] = useState(item.price !== undefined ? String(item.price) : '');
  const [boughtAt, setBoughtAt] = useState(item.boughtAt ?? '');
  const [condition, setCondition] = useState(item.condition);
  return (
    <EditorSheet
      title="Purchase"
      onClose={onClose}
      onSave={() =>
        updateItem(item.id, { purchaseDate, price: parsePrice(price), boughtAt: boughtAt.trim() || undefined, condition })
      }
    >
      <PurchaseDateField value={purchaseDate} onChange={setPurchaseDate} />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Price" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
        <TextField label="Where bought" value={boughtAt} onChange={(e) => setBoughtAt(e.target.value)} />
      </div>
      <ConditionField value={condition} onChange={setCondition} />
    </EditorSheet>
  );
}

function NotesEditor({ item, onClose }: { item: Item; onClose: () => void }) {
  const [notes, setNotes] = useState(item.notes ?? '');
  return (
    <EditorSheet title="Notes" onClose={onClose} onSave={() => updateItem(item.id, { notes: notes.trim() || undefined })}>
      <TextArea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Fit, care instructions, the story behind it…" autoFocus />
    </EditorSheet>
  );
}
