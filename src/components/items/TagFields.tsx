import {
  CATEGORIES,
  COLORS,
  MATERIALS,
  OCCASIONS,
  SEASONS,
  SUBCATEGORIES,
  type CategoryId,
  type OccasionId,
  type SeasonId,
} from '../../config/tags';
import { Chip, ChipMulti, ChipSelect, FieldLabel, Swatch } from '../ui/Chip';

/** Preset-tag pickers shared by "Add piece", the profile editors and (later) the filters. */

export function CategoryField({ value, onChange }: { value?: CategoryId; onChange: (v: CategoryId) => void }) {
  return (
    <section>
      <FieldLabel hint="Required">Category</FieldLabel>
      <ChipSelect options={CATEGORIES} value={value} onChange={(v) => v && onChange(v)} required />
    </section>
  );
}

export function SubcategoryField({
  category,
  value,
  onChange,
}: {
  category?: CategoryId;
  value?: string;
  onChange: (v: string | undefined) => void;
}) {
  if (!category) return null;
  return (
    <section>
      <FieldLabel>Type</FieldLabel>
      <ChipSelect options={SUBCATEGORIES[category]} value={value} onChange={onChange} />
    </section>
  );
}

export function ColorsField({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <section>
      <FieldLabel hint={value.length > 1 ? 'First pick = main color' : undefined}>Colors</FieldLabel>
      <ChipMulti
        options={COLORS}
        value={value}
        onChange={onChange}
        render={(c) => (
          <>
            <Swatch color={c} />
            {c.label}
          </>
        )}
      />
    </section>
  );
}

const ALL_SEASONS = SEASONS.map((s) => s.id);

export function SeasonsField({ value, onChange }: { value: SeasonId[]; onChange: (v: SeasonId[]) => void }) {
  const all = ALL_SEASONS.every((s) => value.includes(s));
  return (
    <section>
      <FieldLabel>Seasons</FieldLabel>
      <ChipMulti
        options={SEASONS}
        value={value}
        onChange={onChange}
        extra={
          <Chip selected={all} onClick={() => onChange(all ? [] : [...ALL_SEASONS])}>
            All seasons
          </Chip>
        }
      />
    </section>
  );
}

export function OccasionsField({ value, onChange }: { value: OccasionId[]; onChange: (v: OccasionId[]) => void }) {
  return (
    <section>
      <FieldLabel>Occasions</FieldLabel>
      <ChipMulti options={OCCASIONS} value={value} onChange={onChange} />
    </section>
  );
}

export function MaterialField({ value, onChange }: { value?: string; onChange: (v: string | undefined) => void }) {
  return (
    <section>
      <FieldLabel hint="Optional">Material</FieldLabel>
      <ChipSelect options={MATERIALS} value={value} onChange={onChange} />
    </section>
  );
}

const CONDITIONS = [
  { id: 'new', label: 'New' },
  { id: 'secondhand', label: 'Secondhand' },
] as const;

export function ConditionField({
  value,
  onChange,
}: {
  value?: 'new' | 'secondhand';
  onChange: (v: 'new' | 'secondhand' | undefined) => void;
}) {
  return (
    <section>
      <FieldLabel>Condition when bought</FieldLabel>
      <ChipSelect options={CONDITIONS} value={value} onChange={onChange} />
    </section>
  );
}
