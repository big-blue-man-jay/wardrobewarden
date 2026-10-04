import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { EMPTY_FILTER, type ItemFilter, type SortKey } from '../lib/filters';

interface ClosetView {
  filter: ItemFilter;
  setFilter: (f: ItemFilter) => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
}

const KEY = 'closet-view';
const Ctx = createContext<ClosetView | null>(null);

function load(): { filter: ItemFilter; sort: SortKey } {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { filter: { ...EMPTY_FILTER, ...parsed.filter }, sort: parsed.sort ?? 'newest' };
    }
  } catch {
    // storage unavailable or corrupt: start fresh
  }
  return { filter: EMPTY_FILTER, sort: 'newest' };
}

/** Keeps closet filters/sort while navigating between screens (and across reloads in the same session). */
export function ClosetFilterProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(load);
  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);
  const value: ClosetView = {
    filter: state.filter,
    sort: state.sort,
    setFilter: (filter) => setState((s) => ({ ...s, filter })),
    setSort: (sort) => setState((s) => ({ ...s, sort })),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useClosetFilter(): ClosetView {
  const v = useContext(Ctx);
  if (!v) throw new Error('useClosetFilter must be used inside ClosetFilterProvider');
  return v;
}
