import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { AddMenu } from './AddMenu';
import { CalendarIcon, ChartIcon, HangerIcon, LayersIcon, PlusIcon } from '../ui/icons';

const TABS = [
  { to: '/closet', label: 'Closet', icon: HangerIcon },
  { to: '/looks', label: 'Looks', icon: LayersIcon },
  null, // + button
  { to: '/journal', label: 'Journal', icon: CalendarIcon },
  { to: '/insights', label: 'Insights', icon: ChartIcon },
] as const;

export function TabBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  // Close the menu if we navigate away by any means (e.g. the back gesture).
  useEffect(() => setMenuOpen(false), [pathname]);
  return (
    <>
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 backdrop-blur-md">
        <ul className="mx-auto grid h-16 max-w-lg grid-cols-5 items-center">
          {TABS.map((tab) =>
            tab === null ? (
              <li key="add" className="flex justify-center">
                <button
                  onClick={() => setMenuOpen(true)}
                  className="tap -mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-paper shadow-lg shadow-ink/20"
                  aria-label="Add"
                >
                  <PlusIcon size={28} />
                </button>
              </li>
            ) : (
              <li key={tab.to}>
                <NavLink
                  to={tab.to}
                  className={({ isActive }) =>
                    `tap flex flex-col items-center gap-0.5 py-1 text-[11px] ${isActive ? 'text-accent' : 'text-muted'}`
                  }
                >
                  <tab.icon size={24} />
                  {tab.label}
                </NavLink>
              </li>
            ),
          )}
        </ul>
      </nav>
      <AddMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
