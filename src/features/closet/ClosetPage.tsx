import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ActiveFilterChips } from '../../components/filters/ActiveFilterChips';
import { FilterSheet } from '../../components/filters/FilterSheet';
import { SearchBar } from '../../components/filters/SearchBar';
import { SortSheet } from '../../components/filters/SortSheet';
import { ItemGrid } from '../../components/items/ItemGrid';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { GearIcon, HangerIcon, PlusIcon, SearchIcon, SlidersIcon, SortIcon } from '../../components/ui/icons';
import { useItems } from '../../db/items';
import { useWearMap } from '../../db/wear';
import { useClosetFilter } from '../../hooks/useClosetFilter';
import { todayISO } from '../../lib/dates';
import { activeChips, EMPTY_FILTER, filterAndSort, isFilterEmpty, SORT_OPTIONS } from '../../lib/filters';

export function ClosetPage() {
  const items = useItems();
  const wear = useWearMap();
  const { filter, setFilter, sort, setSort } = useClosetFilter();
  const [sheet, setSheet] = useState<'filter' | 'sort' | null>(null);

  const visible = useMemo(
    () => (items && wear ? filterAndSort(items, wear, filter, sort, todayISO()) : undefined),
    [items, wear, filter, sort],
  );
  const filterCount = activeChips(filter).length;
  const filtered = !isFilterEmpty(filter);
  const sortLabel = SORT_OPTIONS.find((o) => o.id === sort)?.label.toLowerCase();
  const clearAll = () => setFilter(EMPTY_FILTER);

  return (
    <div className="animate-page">
      <PageHeader
        title="Closet"
        subtitle={
          items && visible
            ? `${filtered ? `${visible.length} of ${items.length}` : items.length} pieces · ${sortLabel}`
            : undefined
        }
        actions={
          <>
            <Link to="/settings" className="tap rounded-full p-2 text-muted" aria-label="Settings">
              <GearIcon />
            </Link>
            <Link
              to="/add"
              className="tap ml-1 flex items-center gap-1 rounded-full bg-ink py-2 pr-4 pl-3 text-sm font-medium text-paper"
            >
              <PlusIcon size={18} /> Add piece
            </Link>
          </>
        }
      >
        {items && items.length > 0 && (
          <>
            <div className="flex items-center gap-2">
              <SearchBar value={filter.query} onChange={(query) => setFilter({ ...filter, query })} />
              <ToolButton label="Filter" onClick={() => setSheet('filter')} badge={filterCount}>
                <SlidersIcon size={20} />
              </ToolButton>
              <ToolButton label="Sort" onClick={() => setSheet('sort')} active={sort !== 'newest'}>
                <SortIcon size={20} />
              </ToolButton>
            </div>
            <ActiveFilterChips filter={filter} onChange={setFilter} onClear={() => setFilter({ ...EMPTY_FILTER, query: filter.query })} />
          </>
        )}
      </PageHeader>

      <div className="mx-auto max-w-3xl px-4 pt-1">
        {items && items.length === 0 && (
          <EmptyState icon={<HangerIcon size={28} />} title="Your closet is empty">
            Tap <strong>Add piece</strong> at the top to photograph your first item.
          </EmptyState>
        )}
        {items && items.length > 0 && visible?.length === 0 && (
          <EmptyState icon={<SearchIcon size={28} />} title="No pieces match">
            <p>Try removing a filter or searching for something else.</p>
            <Button variant="secondary" className="mt-4" onClick={clearAll}>
              Clear search and filters
            </Button>
          </EmptyState>
        )}
        {visible && visible.length > 0 && <ItemGrid items={visible} />}
      </div>

      {items && (
        <FilterSheet
          open={sheet === 'filter'}
          onClose={() => setSheet(null)}
          filter={filter}
          onChange={setFilter}
          items={items}
          resultCount={visible?.length ?? 0}
        />
      )}
      <SortSheet open={sheet === 'sort'} onClose={() => setSheet(null)} value={sort} onChange={setSort} />
    </div>
  );
}

function ToolButton({
  label,
  onClick,
  badge,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  badge?: number;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={badge ? `${label} (${badge} active)` : label}
      className={`tap relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${
        badge || active ? 'border-ink bg-ink text-paper' : 'border-line bg-card text-ink'
      }`}
    >
      {children}
      {!!badge && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-medium text-paper">
          {badge}
        </span>
      )}
    </button>
  );
}
